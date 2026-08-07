import { generateAuthParams } from "@/lib/imagekit";
import { NextResponse } from "next/server";

export async function GET() {
  const params = generateAuthParams();
  return NextResponse.json(params);
}
