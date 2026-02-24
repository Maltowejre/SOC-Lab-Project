import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const rateLimit = new Map<string, { count: number; time: number }>();

export function middleware(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

  const now = Date.now();
  const windowMs = 120 * 1000;
  const maxRequests = 10;

  const record = rateLimit.get(ip);

  if (!record) {
    rateLimit.set(ip, { count: 1, time: now });
  } else {
    if (now - record.time < windowMs) {
      if (record.count >= maxRequests) {
        return new NextResponse("Too Many Requests", { status: 429 });
      }
      record.count++;
    } else {
      rateLimit.set(ip, { count: 1, time: now });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};