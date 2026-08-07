import { upload } from "@imagekit/next";

export const AVATAR_TRANSFORMS = "w-800,h-800,c-limit,q-75,f-auto,fo-auto";

export function withAvatarOptimizations(url: string): string {
  if (!url) return url;
  return `${url.split("?")[0]}?tr=${AVATAR_TRANSFORMS}`;
}

export async function uploadAvatar(file: File): Promise<string> {
  const authRes = await fetch("/api/upload/auth");
  const { token, expire, signature } = await authRes.json();

  const result = await upload({
    file,
    fileName: file.name,
    folder: "/resume-avatars",
    token,
    expire,
    signature,
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
    useUniqueFileName: true,
  });

  if (!result.url) throw new Error("ImageKit upload returned no URL");
  return result.url;
}
