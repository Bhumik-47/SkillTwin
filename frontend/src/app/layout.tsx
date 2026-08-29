import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SkillTwin — Personalized Adaptive Learning Roadmap',
  description: 'AI-guided personalized curriculum that adapts dynamically to your real skill level with continuous progress tracking.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-50 text-slate-900 dark:bg-[#040711] dark:text-slate-100 antialiased min-h-screen selection:bg-brand-500 selection:text-white transition-colors duration-150">
        {children}
      </body>
    </html>
  );
}
