import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center px-4 py-16 text-center">
      <p className="font-heading text-6xl font-bold text-primary">404</p>
      <h1 className="mt-4 text-xl font-semibold text-foreground">
        Page not found &middot; ไม่พบหน้านี้
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or may have been
        moved.
        <br />
        หน้าที่คุณกำลังหาไม่มีอยู่ หรืออาจถูกย้ายไปแล้ว
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Back to home &middot; กลับหน้าแรก</Link>
      </Button>
    </div>
  );
}
