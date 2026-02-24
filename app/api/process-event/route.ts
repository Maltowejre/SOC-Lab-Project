import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY!);

function riskLevel(score: number) {
  if (score >= 70) return "High";
  if (score >= 35) return "Medium";
  return "Low";
}

export async function POST(req: Request) {
  console.log("PROCESS EVENT CALLED");

  const body = await req.json().catch(() => ({}));
  const eventId = body?.event_id as string | undefined;

  if (!eventId) {
    return NextResponse.json({ error: "event_id is required" }, { status: 400 });
  }

  const { data: ev, error: evErr } = await supabase
    .from("security_events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (evErr || !ev) {
    console.log("Event fetch error:", evErr);
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const email = ev.user_email ?? null;
  const ip = ev.ip_address ?? null;

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  const { count: failsForSameEmail } = await supabase
    .from("security_events")
    .select("*", { count: "exact", head: true })
    .eq("success", false)
    .eq("user_email", email)
    .gte("created_at", fiveMinutesAgo);

  const { count: failsForSameIP } = await supabase
    .from("security_events")
    .select("*", { count: "exact", head: true })
    .eq("success", false)
    .eq("ip_address", ip)
    .gte("created_at", fiveMinutesAgo);

  const isBruteForceEmail = (failsForSameEmail ?? 0) >= 5;
  const isExcessiveIP = (failsForSameIP ?? 0) >= 10;

  const LOCK_MINUTES = 10;

  const { data: prof } = await supabase
    .from("user_login_profile")
    .select("*")
    .eq("user_email", email)
    .single();

  let failedAttempts = 0;
  let lockedUntil: string | null = null;

  if (!prof) {
    failedAttempts = ev.success ? 0 : 1;

    if (isBruteForceEmail) {
      lockedUntil = new Date(
        Date.now() + LOCK_MINUTES * 60 * 1000
      ).toISOString();
    }

    await supabase.from("user_login_profile").insert([
      {
        user_email: email,
        failed_attempts: failedAttempts,
        locked_until: lockedUntil,
        last_ip: ip,
        last_seen: new Date().toISOString(),
      },
    ]);
  } else {
    failedAttempts = ev.success ? 0 : (prof.failed_attempts ?? 0) + 1;

    if (isBruteForceEmail) {
      lockedUntil = new Date(
        Date.now() + LOCK_MINUTES * 60 * 1000
      ).toISOString();
    } else {
      lockedUntil = prof.locked_until;
    }

    await supabase
      .from("user_login_profile")
      .update({
        failed_attempts: failedAttempts,
        locked_until: lockedUntil,
        last_ip: ip,
        last_seen: new Date().toISOString(),
      })
      .eq("user_email", email);
  }

  let score = 0;
  if (!ev.success) score += 10;
  if (isBruteForceEmail) score += 80;
  if (isExcessiveIP) score += 70;

  const level = riskLevel(score);

  await supabase
    .from("security_events")
    .update({
      risk_score: score,
      risk_level: level,
    })
    .eq("id", eventId);

  if (level === "High") {
    const alertType = isBruteForceEmail
      ? "Brute Force (Account)"
      : isExcessiveIP
      ? "Brute Force (IP)"
      : "High Risk Login";

    const desc = `High risk login detected for ${email}`;

    await supabase.from("security_alerts").insert([
      {
        alert_type: alertType,
        risk_level: level,
        description: desc,
        status: "Open",
        related_event_id: eventId,
      },
    ]);

    try {
      await resend.emails.send({
        from: process.env.ALERT_EMAIL_FROM!,
        to: process.env.ALERT_EMAIL_TO!,
        subject: `🚨 SOC Alert: ${alertType} [${level}]`,
        text: `
🚨 SOC Alert Notification

Alert Type: ${alertType}
Risk Level: ${level}
User: ${email || "Unknown"}
IP Address: ${ip || "Unknown"}
Failed Attempts (Email): ${failsForSameEmail ?? 0}
Failed Attempts (IP): ${failsForSameIP ?? 0}
Time: ${new Date().toISOString()}

Description:
${desc}

-- SOC Monitoring System
        `.trim(),
      });

      console.log("Alert email sent");
    } catch (err) {
      console.log("Email error:", err);
    }
  }

  return NextResponse.json({
    ok: true,
    brute_force_email: isBruteForceEmail,
    excessive_ip: isExcessiveIP,
  });
}