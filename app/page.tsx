import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-white flex items-center justify-center p-6">
      <div className="max-w-3xl w-full text-center space-y-8">

        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">
            🛡 SOC Lab
          </h1>

          <p className="text-lg text-gray-400 leading-relaxed">
            A real-time Security Operations Center simulation platform 
            designed to monitor authentication activity, detect threats,
            and automate incident response.
          </p>

          <p className="text-sm text-gray-500">
            Includes brute force detection, risk scoring, new IP & country alerts,
            automated account lock, and high-risk email notifications.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Link
            href="/login"
            className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition font-semibold shadow-lg"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="px-8 py-3 rounded-xl border border-zinc-600 hover:bg-zinc-800 transition font-semibold"
          >
            Register
          </Link>
        </div>

        {/* Feature Box */}
        <div className="mt-12 grid md:grid-cols-3 gap-6 text-left">
          <div className="bg-zinc-900/70 backdrop-blur border border-zinc-700 p-6 rounded-xl">
            <h3 className="font-semibold mb-2 text-blue-400">Threat Detection</h3>
            <p className="text-sm text-gray-400">
              Detect brute force attempts and suspicious login behavior in real time.
            </p>
          </div>

          <div className="bg-zinc-900/70 backdrop-blur border border-zinc-700 p-6 rounded-xl">
            <h3 className="font-semibold mb-2 text-green-400">Risk Scoring</h3>
            <p className="text-sm text-gray-400">
              Dynamic risk calculation based on behavior and login patterns.
            </p>
          </div>

          <div className="bg-zinc-900/70 backdrop-blur border border-zinc-700 p-6 rounded-xl">
            <h3 className="font-semibold mb-2 text-red-400">Automated Response</h3>
            <p className="text-sm text-gray-400">
              Account locking and email alerts triggered automatically for high-risk events.
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}