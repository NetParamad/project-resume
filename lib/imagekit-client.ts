import { upload } from "@imagekit/next";

export const AVATAR_TRANSFORMS = "w-800,h-800,c-limit,q-75,f-auto,fo-auto";

export function withAvatarOptimizations(url: string): string {
  if (!url) return url;
  return `${url.split("?")[0]}?tr=${AVATAR_TRANSFORMS}`;
}

export async function uploadAvatar(file: File): Promise<string> {
  const normalized = await normalizeImage(file);
  const authRes = await fetch("/api/upload/auth");
  const { token, expire, signature } = await authRes.json();

  const result = await upload({
    file: normalized,
    fileName: normalized.name,
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

const MAX_DIMENSION = 800;

async function normalizeImage(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });
    const scale = Math.min(
      1,
      MAX_DIMENSION / Math.max(bitmap.width, bitmap.height),
    );
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const type = file.type === "image/png" ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, type, 0.9),
    );
    if (!blob) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "") || "avatar";
    const ext = type === "image/png" ? "png" : "jpg";
    return new File([blob], `${baseName}.${ext}`, { type });
  } catch {
    return file;
  }
}
