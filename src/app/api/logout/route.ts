import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  
  // Delete the Payload authentication cookie
  cookieStore.delete("payload-token");
  
  return NextResponse.json({ success: true, message: "Logged out successfully" });
}
