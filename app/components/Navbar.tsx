"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

type NavItem = { href: string; label: string };

const navItems: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  
  { href: "/diseaseprediction", label: "Disease Prediction" },
  { href: "/growthprediction", label: "Growth Prediction" },
  { href: "/harvest-readiness", label: "Harvest Readiness" },
  { href: "/robotic-harvesting", label: "AI Robotic Harvesting" },
  { href: "/history", label: "History" },
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
    <header className="sticky top-0 z-50 w-full border-b border-green-100 bg-white/90 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="group inline-flex items-center gap-3 rounded-xl px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          onClick={() => setOpen(false)}
        >
          <span className="grid h-10 w-10 place-items-center rounded-full bg-green-800 text-white shadow-sm">
            <span className="text-lg leading-none">🌿</span>
          </span>

          <div className="leading-tight">
            <div className="text-base font-bold text-gray-900 md:text-lg">
              CinnaAI
            </div>
            <div className="text-xs font-medium text-gray-500">
              Monitoring platform
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Primary"
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "rounded-full px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500",
                item.active
                  ? "border border-green-300 bg-green-50 text-green-800 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-green-800",
              ].join(" ")}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Side */}
        <div className="hidden items-center gap-3 md:flex">
          <div className="rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-800">
            Admin User
          </div>
        </div>

        {/* Mobile Button */}
        <div className="flex items-center gap-2 lg:hidden">
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

      {/* Mobile Navigation */}
      <div id="mobile-nav" className={["lg:hidden", open ? "block" : "hidden"].join(" ")}>
        <div className="mx-auto max-w-7xl px-4 pb-4 md:px-6">
          <div className="rounded-2xl border border-green-100 bg-white p-2 shadow-sm">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={[
                  "block rounded-xl px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500",
                  item.active
                    ? "bg-green-50 text-green-800"
                    : "text-gray-700 hover:bg-gray-50 hover:text-green-800",
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