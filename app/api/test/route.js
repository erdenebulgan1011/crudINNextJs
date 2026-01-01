import dbConnect from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();
  return NextResponse.json({ message: "MongoDB connected ✅" });
}
