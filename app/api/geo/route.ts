import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const ip = new URL(req.url).searchParams.get("ip");
  if (!ip || ip === "unknown") {
    return NextResponse.json({ country: "unknown" });
  }

  const res = await fetch(`https://ipapi.co/${ip}/json/`, {
    headers: { "User-Agent": "soc-project" },
  });

  if (!res.ok) {
    return NextResponse.json({ country: "unknown" });
  }

  const data = await res.json();
  return NextResponse.json({
    country: data.country_name || data.country || "unknown",
  });
}