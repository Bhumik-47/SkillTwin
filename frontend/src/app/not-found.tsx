import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#070b12] text-white p-4">
      <div className="rounded-3xl border border-white/10 bg-surface-100/80 p-8 text-center shadow-2xl backdrop-blur-xl max-w-md w-full shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
        <span className="rounded-full bg-brand-500/15 px-3 py-1 text-[10px] font-bold font-mono text-brand-400 border border-brand-500/30 uppercase tracking-wider">
          404 Error
        </span>
        <h2 className="text-2xl font-extrabold tracking-tight mt-3">Page Not Found</h2>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          Could not locate the requested curriculum node or learning module in the current graph.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow-[0_2px_10px_rgba(79,70,229,0.3)] hover:bg-brand-500 active:scale-[0.97] transition-all"
        >
          Return to Curriculum Roadmap
        </Link>
      </div>
    </div>
  );
}
