"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

type NavItem = { href: string; label: string };

const navItems: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/diseaseprediction", label: "Disease Prediction" },
  { href: "/growthprediction", label: "Growth Prediction" }, // ✅ NEW PAGE
  { href: "/history", label: "History" }
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);

  const items = useMemo(
    () =>
      navItems.map((item) => ({
        ...item,
        active: isActivePath(pathname, item.href),
      })),
    [pathname]
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 rounded-xl px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          onClick={() => setOpen(false)}
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-green-600 to-emerald-400 text-white shadow-sm">
            <span className="text-base leading-none">🌿</span>
          </span>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-gray-900 md:text-base">
              Cinnamon AI
            </div>
            <div className="text-xs text-gray-500">Monitoring platform</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "rounded-xl px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500",
                item.active
                  ? "bg-green-50 text-green-800"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
              ].join(" ")}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
            <span className="text-lg leading-none">{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={[
          "md:hidden",
          open ? "block" : "hidden",
        ].join(" ")}
      >
        <div className="mx-auto max-w-6xl px-4 pb-4 md:px-6">
          <div className="rounded-2xl border border-black/5 bg-white p-2 shadow-sm">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={[
                  "block rounded-xl px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500",
                  item.active
                    ? "bg-green-50 text-green-800"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                ].join(" ")}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}