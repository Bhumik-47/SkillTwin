import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#090d16] text-white p-4">
      <h2 className="text-2xl font-bold">Page Not Found</h2>
      <p className="text-sm text-slate-400 mt-2">Could not find the requested learning module.</p>
      <Link
        href="/"
        className="mt-4 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-500 transition-all"
      >
        Return to Roadmap
      </Link>
    </div>
  );
}
