"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Patrones", path: "/catalogo", activePath: "/catalogo" },
  { label: "Mi Progreso", path: "/progress", activePath: "/progress" },
  { label: "Comunidad", path: "/community", activePath: "/community" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <>
      {/* Top accent line */}
      <div className="fixed top-0 left-0 w-full h-1 bg-primary/20 z-[60]" />

      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-outline-variant/30">
        <div className="h-16 max-w-[1280px] mx-auto px-[24px] flex items-center justify-between">
          {/* Left: Logo + Status */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-headline-sm">
                grid_view
              </span>
              <span className="font-headline text-headline-sm tracking-tighter text-on-surface uppercase font-medium">
                PatternMaster
              </span>
            </Link>

            <div className="hidden lg:flex items-center bg-surface-container px-3 py-1 border border-outline-variant/20">
              <span className="font-body text-code-sm text-primary animate-pulse">
                system_status: active
              </span>
            </div>
          </div>

          {/* Center: Nav */}
          <nav className="hidden md:flex items-center gap-8 h-full">
            {navItems.map((item) => {
              const isActive = pathname === item.activePath;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`h-full flex items-center transition-colors ${
                    isActive
                      ? "text-primary border-b-2 border-primary"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Search + Avatar */}
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant">
                search
              </span>
            </button>
            <div className="w-8 h-8 bg-primary flex items-center justify-center cursor-pointer hover:ring-2 ring-primary/30 transition-all">
              <span className="material-symbols-outlined text-on-primary text-[18px]">
                person
              </span>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
