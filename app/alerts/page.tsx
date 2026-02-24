"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

type AlertRow = {
  id: string;
  created_at: string;
  alert_type: string;
  risk_level: "Low" | "Medium" | "High" | string;
  description: string;
  status: "Open" | "Closed" | string;
  related_event_id: string | null;
};

type EventRow = {
  id: string;
  created_at: string;
  event_type: string;
  user_email: string | null;
  ip_address: string | null;
  user_agent: string | null;
  country: string | null;
  risk_score: number | null;
  risk_level: string | null;
  success: boolean | null;
  metadata: any;
};

function badgeClass(level: string) {
  if (level === "High") return "bg-red-600/20 text-red-300 border-red-600/30";
  if (level === "Medium")
    return "bg-yellow-600/20 text-yellow-200 border-yellow-600/30";
  return "bg-green-600/20 text-green-200 border-green-600/30";
}

function statusClass(status: string) {
  if (status === "Closed")
    return "bg-zinc-700/50 text-zinc-200 border-zinc-600/40";
  return "bg-blue-600/20 text-blue-200 border-blue-600/30";
}

export default function AlertsCenter() {
  const router = useRouter();

  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [riskFilter, setRiskFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("Open");

  const [selected, setSelected] = useState<AlertRow | null>(null);
  const [relatedEvent, setRelatedEvent] = useState<EventRow | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) router.replace("/login");
      await fetchAlerts();
      setLoading(false);
    })();
    
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);

    let q = supabase
      .from("security_alerts")
      .select("*")
      .order("created_at", { ascending: false });

    if (statusFilter !== "All") q = q.eq("status", statusFilter);
    if (riskFilter !== "All") q = q.eq("risk_level", riskFilter);

    const { data, error } = await q;
    if (error) console.log("fetchAlerts error:", error);

    setAlerts((data as AlertRow[]) || []);
    setLoading(false);
  };

  const openDetails = async (a: AlertRow) => {
    setSelected(a);
    setRelatedEvent(null);

    if (!a.related_event_id) return;

    setDetailsLoading(true);
    const { data, error } = await supabase
      .from("security_events")
      .select("*")
      .eq("id", a.related_event_id)
      .single();

    if (error) console.log("related event error:", error);
    setRelatedEvent((data as EventRow) || null);
    setDetailsLoading(false);
  };

  const closeAlert = async (id: string) => {
    const { error } = await supabase
      .from("security_alerts")
      .update({ status: "Closed" })
      .eq("id", id);

    if (error) {
      alert("Failed to close alert");
      return;
    }

    setAlerts(prev =>
      prev.map(a => (a.id === id ? { ...a, status: "Closed" } : a))
    );
  };

  const openCount = useMemo(
    () => alerts.filter(a => a.status === "Open").length,
    [alerts]
  );

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="mx-auto w-full max-w-6xl bg-zinc-900 rounded-2xl p-6 shadow-2xl border border-zinc-800">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">🚨 Alerts Center</h1>
            <p className="text-sm text-zinc-400 mt-1">
              Manage SOC alerts (Open/Closed) and view investigation details.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700"
            >
              ← Back to Dashboard
            </Link>

            <div className="text-sm px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700">
              Open: <span className="font-semibold text-blue-300">{openCount}</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-zinc-800/60 rounded-xl p-4 border border-zinc-700 mb-6 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs text-zinc-300 mb-1">Risk Level</label>
            <select
              value={riskFilter}
              onChange={e => setRiskFilter(e.target.value)}
              className="bg-black border border-zinc-700 rounded px-3 py-2 text-sm"
            >
              <option value="All">All</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-zinc-300 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-black border border-zinc-700 rounded px-3 py-2 text-sm"
            >
              <option value="All">All</option>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <button
            onClick={fetchAlerts}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Apply
          </button>

          <button
            onClick={() => {
              setRiskFilter("All");
              setStatusFilter("Open");
              setTimeout(fetchAlerts, 0);
            }}
            className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Reset
          </button>
        </div>

        {/* Table */}
        <div className="bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700">
          <div className="max-h-[520px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-700/70 sticky top-0">
                <tr>
                  <th className="text-left p-4">Time</th>
                  <th className="text-left p-4">Alert Type</th>
                  <th className="text-left p-4">Risk</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td className="p-6 text-zinc-300" colSpan={5}>
                      Loading...
                    </td>
                  </tr>
                ) : alerts.length === 0 ? (
                  <tr>
                    <td className="p-6 text-zinc-300" colSpan={5}>
                      No alerts found for selected filters.
                    </td>
                  </tr>
                ) : (
                  alerts.map(a => (
                    <tr
                      key={a.id}
                      className="border-b border-zinc-700 hover:bg-zinc-700/40 transition"
                    >
                      <td className="p-4 text-zinc-200">
                        {new Date(a.created_at).toLocaleString()}
                      </td>

                      <td className="p-4 font-semibold">{a.alert_type}</td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full border text-xs ${badgeClass(
                            a.risk_level
                          )}`}
                        >
                          {a.risk_level}
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full border text-xs ${statusClass(
                            a.status
                          )}`}
                        >
                          {a.status}
                        </span>
                      </td>

                      <td className="p-4 flex gap-2">
                        <button
                          onClick={() => openDetails(a)}
                          className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg text-xs font-semibold"
                        >
                          View
                        </button>

                        <button
                          onClick={() => closeAlert(a.id)}
                          disabled={a.status === "Closed"}
                          className={`px-3 py-2 rounded-lg text-xs font-semibold border ${
                            a.status === "Closed"
                              ? "bg-zinc-800 text-zinc-500 border-zinc-700 cursor-not-allowed"
                              : "bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border-zinc-700"
                          }`}
                        >
                          Close
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

      {/* Details Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-bold">Alert Details</h2>
                <p className="text-sm text-zinc-400 mt-1">{selected.alert_type}</p>
              </div>

              <button
                onClick={() => {
                  setSelected(null);
                  setRelatedEvent(null);
                }}
                className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="bg-zinc-800/60 border border-zinc-700 rounded-xl p-4 mb-4">
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-zinc-400 text-xs">Created</div>
                  <div>{new Date(selected.created_at).toLocaleString()}</div>
                </div>

                <div>
                  <div className="text-zinc-400 text-xs">Status</div>
                  <div>{selected.status}</div>
                </div>

                <div>
                  <div className="text-zinc-400 text-xs">Risk</div>
                  <div>{selected.risk_level}</div>
                </div>

                <div>
                  <div className="text-zinc-400 text-xs">Related Event</div>
                  <div className="truncate">
                    {selected.related_event_id || "—"}
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <div className="text-zinc-400 text-xs mb-1">Description</div>
                <div className="text-sm">{selected.description}</div>
              </div>
            </div>

            <div className="bg-zinc-800/60 border border-zinc-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold">Related Event Data</div>
                {detailsLoading && <div className="text-xs text-zinc-400">Loading…</div>}
              </div>

              {!selected.related_event_id ? (
                <div className="text-sm text-zinc-300">No related event linked.</div>
              ) : relatedEvent ? (
                <div className="text-sm text-zinc-200 grid sm:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-zinc-400">Event Type</div>
                    <div>{relatedEvent.event_type}</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-400">Email</div>
                    <div>{relatedEvent.user_email || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-400">IP</div>
                    <div>{relatedEvent.ip_address || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-400">Country</div>
                    <div>{relatedEvent.country || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-400">Risk Score</div>
                    <div>{relatedEvent.risk_score ?? "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-400">Success</div>
                    <div>{String(relatedEvent.success ?? "—")}</div>
                  </div>

                  <div className="sm:col-span-2">
                    <div className="text-xs text-zinc-400">User Agent</div>
                    <div className="truncate">{relatedEvent.user_agent || "—"}</div>
                  </div>

                  <div className="sm:col-span-2">
                    <div className="text-xs text-zinc-400">Metadata</div>
                    <pre className="text-xs bg-black/40 border border-zinc-700 rounded-lg p-3 overflow-auto max-h-48">
{JSON.stringify(relatedEvent.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-zinc-300">
                  No event found or not loaded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}