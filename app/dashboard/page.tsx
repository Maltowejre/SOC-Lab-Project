"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

type SecurityEvent = {
  id: string;
  created_at: string;
  event_type: string;
  user_email: string | null;
  ip_address: string | null;
  user_agent: string | null;
  success: boolean | null;
  risk_level?: string | null;
  metadata: any;
};

export default function Dashboard() {
  const router = useRouter();

  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      router.replace("/login");
      return;
    }
    await fetchEvents();
  };

  const fetchEvents = async (from?: string, to?: string) => {
    setLoading(true);

    let query = supabase
      .from("security_events")
      .select("*")
      .order("created_at", { ascending: false });

    if (from) query = query.gte("created_at", from);
    if (to) query = query.lte("created_at", to);

    const { data } = await query;
    setEvents(data || []);
    setLoading(false);
  };

  const handleApply = () => {
    const fromISO = fromDate ? new Date(fromDate).toISOString() : undefined;
    const toISO = toDate ? new Date(toDate).toISOString() : undefined;
    fetchEvents(fromISO, toISO);
  };

  const handleReset = () => {
    setFromDate("");
    setToDate("");
    fetchEvents();
  };

  const stats = useMemo(() => {
    const total = events.length;
    const failed = events.filter((e) => e.success === false).length;
    const success = events.filter((e) => e.success === true).length;
    return { total, failed, success };
  }, [events]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const riskBadge = (level?: string | null) => {
    if (!level) return "bg-zinc-700 text-zinc-300";
    if (level === "High") return "bg-red-500/20 text-red-400";
    if (level === "Medium") return "bg-yellow-500/20 text-yellow-400";
    return "bg-green-500/20 text-green-400";
  };

  return (
    <div className="min-h-screen bg-black text-white flex justify-center p-10">
      <div className="w-full max-w-6xl bg-zinc-900 rounded-2xl p-8 shadow-2xl border border-zinc-800">

        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold">🛡 SOC Dashboard</h1>
            <p className="text-sm text-zinc-400 mt-1">
              Monitor authentication activity & security signals
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/alerts"
              className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-4 py-2 rounded-lg text-sm"
            >
              🚨 Alerts Center
            </Link>

            <button
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg text-sm font-semibold"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <StatCard title="Total Events" value={stats.total} color="text-blue-400" />
          <StatCard title="Successful Logins" value={stats.success} color="text-green-400" />
          <StatCard title="Failed Logins" value={stats.failed} color="text-red-400" />
        </div>

        {/* Filters */}
        <div className="bg-zinc-800 p-5 rounded-xl mb-6 flex flex-wrap gap-4 items-end border border-zinc-700">

          <div>
            <label className="block text-xs text-gray-400 mb-1">From</label>
            <input
              type="datetime-local"
              className="bg-black border border-zinc-700 rounded px-3 py-2 text-sm"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">To</label>
            <input
              type="datetime-local"
              className="bg-black border border-zinc-700 rounded px-3 py-2 text-sm"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <button
            onClick={handleApply}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
          >
            Apply
          </button>

          <button
            onClick={handleReset}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-sm"
          >
            Reset
          </button>
        </div>

        {/* Table */}
        <div className="bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700">
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-700">
                <tr>
                  <th className="text-left p-4">Time</th>
                  <th className="text-left p-4">Email</th>
                  <th className="text-left p-4">IP</th>
                  <th className="text-left p-4">Device</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Risk</th>
                  <th className="text-left p-4">Details</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-zinc-300">
                      Loading...
                    </td>
                  </tr>
                ) : (
                  events.map((e) => (
                    <tr
                      key={e.id}
                      className="border-b border-zinc-700 hover:bg-zinc-700/40 transition"
                    >
                      <td className="p-4">
                        {new Date(e.created_at).toLocaleString()}
                      </td>

                      <td className="p-4">{e.user_email}</td>

                      <td className="p-4 text-xs text-gray-300">
                        {e.ip_address}
                      </td>

                      <td className="p-4 text-xs text-gray-400 max-w-[200px] truncate">
                        {e.user_agent}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            e.success
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {e.success ? "SUCCESS" : "FAILED"}
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${riskBadge(
                            e.risk_level
                          )}`}
                        >
                          {e.risk_level || "—"}
                        </span>
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() =>
                            alert(JSON.stringify(e.metadata, null, 2))
                          }
                          className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-zinc-800 rounded-xl p-6 text-center border border-zinc-700">
      <p className="text-sm text-gray-400 mb-2">{title}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}