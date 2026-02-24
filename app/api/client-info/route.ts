import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");

  const ip =
    (forwardedFor ? forwardedFor.split(",")[0].trim() : null) ||
    realIp ||
    "unknown";

  return NextResponse.json({
    ip,
    userAgent: req.headers.get("user-agent") || "unknown",
  });
}