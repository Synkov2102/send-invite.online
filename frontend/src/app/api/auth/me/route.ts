import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  // Guests are the common case on public pages: 200 keeps the browser console free of 401s.
  return NextResponse.json({ user: await getCurrentUser() });
}
