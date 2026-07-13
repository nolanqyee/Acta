import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stilva",
  description: "Personal evidence graph",
};

const nav = [
  { href: "/", label: "Home" },
  { href: "/capture", label: "Capture" },
  { href: "/graph", label: "Graph" },
  { href: "/explore", label: "Explore" },
  { href: "/skills", label: "Skills" },
  { href: "/stories", label: "Stories" },
  { href: "/adapters/app-question", label: "App question" },
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-50 text-stone-900 antialiased">
        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-4 py-3">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              Stilva
            </Link>
            <nav className="flex flex-wrap gap-3 text-sm text-stone-600">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hover:text-stone-900"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
