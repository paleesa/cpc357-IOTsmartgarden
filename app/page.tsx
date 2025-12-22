import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white">
      <h1 className="text-4xl font-bold mb-4">USM IoT Project</h1>
      <p className="mb-8 text-slate-400">Monitoring Temperature & Humidity in Real-time</p>
      <Link 
        href="/dashboard" 
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition"
      >
        View Dashboard
      </Link>
    </div>
  );
}