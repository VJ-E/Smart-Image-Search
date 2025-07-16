import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { existsSync } from "fs";

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const file: File | null = data.get("image") as unknown as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = new Uint8Array(bytes);

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, file.name);

  await writeFile(filePath, buffer);

  return NextResponse.json({ message: "Image uploaded successfully" });
}
