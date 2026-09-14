import { useEffect } from "react";
import { useResumeStore } from "@/lib/store/resume-store";
import { splitFields } from "@/lib/ai/split-fields";
import { sectionFieldOrder } from "@/lib/ai/section-fields";
import type { ResumeData, SectionType } from "@/lib/types/resume";

interface HasId {
  id: string;
}

/**
 * Listens for the "ai-autofill" event a section's AIAssistButton dispatches
 * and applies the result: split into this section's fields (splitFields +
 * sectionFieldOrder), then patched onto the targeted item — or the last
 * item, or a newly-added one if the list is empty. Shared by every list
 * section's *Form.tsx so this apply logic exists in exactly one place.
 */
export function useAiAutofillListener<T extends HasId>(
  section: SectionType,
  update: (id: string, patch: Partial<T>) => void,
  add: () => void,
) {
  useEffect(() => {
    const getList = (): T[] =>
      (useResumeStore.getState().data[section as keyof ResumeData] as T[] | undefined) ?? [];

    const handler = (e: Event) => {
      const { section: eventSection, content, itemId } = (e as CustomEvent).detail as {
        section: string;
        content: string;
        itemId?: string;
      };
      if (eventSection !== section || !content) return;

      const patch = splitFields(content, sectionFieldOrder(section)) as Partial<T>;

      if (itemId) {
        update(itemId, patch);
        return;
      }

      const list = getList();
      if (list.length > 0) {
        update(list[list.length - 1].id, patch);
      } else {
        add();
        const after = getList();
        if (after.length > 0) update(after[after.length - 1].id, patch);
      }
    };

    window.addEventListener("ai-autofill", handler);
    return () => window.removeEventListener("ai-autofill", handler);
  }, [section, update, add]);
}
