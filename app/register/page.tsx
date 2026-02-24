"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (!error) {
      toast.success("Account created successfully 🎉");

      await supabase.from("security_events").insert([
        {
          event_type: "account_created",
          user_email: email,
          success: true,
          metadata: {
            source: "web_app",
            created_at: new Date().toISOString(),
          },
        },
      ]);

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } else {
      toast.error(error.message);
    }
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
          background: "#242a34",
          boxShadow: "0 0 40px rgba(0,0,0,0.4)",
        }}
      >
        <h1 style={{ marginBottom: 20 }}>📝 Register</h1>

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
          type="email"
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
          onClick={handleRegister}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 8,
            border: "none",
            background: "#10b981",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Create Account
        </button>

        <p style={{ marginTop: 15, fontSize: 14 }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#60a5fa" }}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}