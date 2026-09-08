-- ============================================================
-- Distributed rate limiting (replaces per-instance in-memory)
-- Callers fall back to in-memory if this RPC is missing, so
-- deploying without applying this file stays safe.
-- ============================================================

CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  user_id UUID, -- null for IP-scoped keys
  count INTEGER NOT NULL DEFAULT 0,
  limit_count INTEGER NOT NULL,
  window_ms INTEGER NOT NULL,
  reset_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SECURITY DEFINER: bypasses RLS so any authenticated user can bump
-- their own counters without a service-role key. Grants EXECUTE to
-- public by default; callers are always authenticated.
CREATE OR REPLACE FUNCTION rate_limit_bump(
  p_key TEXT,
  p_user UUID,
  p_limit INTEGER,
  p_window_ms INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row rate_limits%ROWTYPE;
  v_now TIMESTAMPTZ := now();
  v_retry INTEGER;
BEGIN
  SELECT * INTO v_row FROM rate_limits WHERE key = p_key FOR UPDATE;

  IF v_row IS NULL OR v_now >= v_row.reset_at THEN
    INSERT INTO rate_limits (key, user_id, count, limit_count, window_ms, reset_at)
    VALUES (p_key, p_user, 1, p_limit, p_window_ms, v_now + (p_window_ms * interval '1 millisecond'))
    ON CONFLICT (key) DO UPDATE SET
      count = 1,
      limit_count = excluded.limit_count,
      window_ms = excluded.window_ms,
      user_id = COALESCE(excluded.user_id, rate_limits.user_id),
      reset_at = now() + (excluded.window_ms * interval '1 millisecond');
    RETURN jsonb_build_object('ok', true, 'retry_after_sec', 0);
  END IF;

  IF v_row.count >= v_row.limit_count THEN
    SELECT GREATEST(1, CEIL(EXTRACT(EPOCH FROM (v_row.reset_at - v_now)))) INTO v_retry;
    RETURN jsonb_build_object('ok', false, 'retry_after_sec', v_retry);
  END IF;

  UPDATE rate_limits SET count = count + 1 WHERE key = p_key;
  RETURN jsonb_build_object('ok', true, 'retry_after_sec', 0);
END;
$$;

-- Keeps the table lean: drop stale entries every now and then.
CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_at ON rate_limits(reset_at);