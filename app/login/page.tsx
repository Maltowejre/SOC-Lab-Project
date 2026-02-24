"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);

    let ip_address: string | null = null;
    let user_agent: string | null = null;

    try {
      const infoRes = await fetch("/api/client-info");
      const info = await infoRes.json();
      ip_address = info?.ip ?? null;
      user_agent = info?.userAgent ?? null;
    } catch {}


    try {
      const { data: prof } = await supabase
        .from("user_login_profile")
        .select("locked_until")
        .eq("user_email", email)
        .maybeSingle();

      if (prof?.locked_until) {
        const lockedUntil = new Date(prof.locked_until);
        const now = new Date();

        if (lockedUntil.getTime() > now.getTime()) {
          const diffMin = Math.ceil(
            (lockedUntil.getTime() - now.getTime()) / 60000
          );

          toast.error(
            `Account locked. Try again in ${diffMin} minute(s).`
          );

          setLoading(false);
          return;
        }
      }
    } catch {}


    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });



    const { data: inserted } = await supabase
      .from("security_events")
      .insert([
        {
          event_type: error ? "login_failed" : "login_success",
          user_email: email,
          ip_address,
          user_agent,
          success: !error,
          metadata: {
            source: "web_app",
            reason: error
              ? "invalid_credentials"
              : "authenticated",
            login_time: new Date().toISOString(),
          },
        },
      ])
      .select("id")
      .single();

    if (inserted?.id) {
      fetch("/api/process-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: inserted.id }),
      });
    }


    if (!error) {
      toast.success("Logged in successfully!");
      router.push("/dashboard");
    } else {
      toast.error("Invalid email or password");
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #292930, #314e59)",
        color: "white",
      }}
    >
      <div
        style={{
          width: 400,
          padding: 30,
          borderRadius: 16,
          background: "#1f2937",
          boxShadow: "0 0 40px rgba(0,0,0,0.4)",
        }}
      >
        <h1 style={{ marginBottom: 20 }}>🔐 Login</h1>

        <Link
          href="/"
          style={{
            display: "inline-block",
            marginBottom: 20,
            fontSize: 14,
            color: "#60a5fa",
            textDecoration: "none",
          }}
        >
          ← Back to Home
        </Link>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 12,
            borderRadius: 8,
            border: "1px solid #374151",
            background: "#111827",
            color: "white",
          }}
        />

        <div style={{ position: "relative", marginBottom: 16 }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 8,
              border: "1px solid #374151",
              background: "#111827",
              color: "white",
            }}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: 10,
              top: 8,
              background: "transparent",
              border: "none",
              color: "#60a5fa",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 8,
            border: "none",
            background: loading ? "#375a7a" : "#528fc5",
            color: "white",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.8 : 1,
          }}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <p style={{ marginTop: 15, fontSize: 14 }}>
          Don't have an account?{" "}
          <Link href="/register" style={{ color: "#60a5fa" }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}