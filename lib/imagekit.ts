import "server-only";

import crypto from "node:crypto";

export function generateAuthParams() {
  const token = crypto.randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 3540;
  const signature = crypto
    .createHmac("sha1", process.env.IMAGEKIT_PRIVATE_KEY!)
    .update(token + expire)
    .digest("hex");
  return { token, expire, signature };
}

export function getImageKitConfig() {
  return {
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
  };
}
