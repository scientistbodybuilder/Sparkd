"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

const Header = () => {
  const { user, signOutUser } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  if (
    (pathname.includes("quiz") && !pathname.includes("results")) ||
    pathname === "/"
  ) {
    return null;
  }

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      <Link
        href="/dashboard"
        className="text-slate-300 hover:text-white"
        onClick={onClick}
      >
        Dashboard
      </Link>
      <Link
        href="/profile"
        className="text-slate-300 hover:text-white"
        onClick={onClick}
      >
        Profile
      </Link>
      <Link
        href="/upload"
        className="text-slate-300 hover:text-white"
        onClick={onClick}
      >
        Upload
      </Link>
      <Link
        href="/scores"
        className="text-slate-300 hover:text-white"
        onClick={onClick}
      >
        Score
      </Link>
    </>
  );

  return (
    <header className="relative flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-4 box-border md:px-6">
      <div className="flex items-center">
        <Link href="/dashboard" className="text-lg font-semibold text-white md:text-xl">
          Sparkd
        </Link>
      </div>

      {/* Desktop nav */}
      <div className="hidden items-center gap-6 md:flex">
        <div className="flex gap-4 text-xs md:text-sm">
          <NavLinks />
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="max-w-[160px] truncate text-slate-300">
            {user?.email}
          </span>
          <button
            onClick={signOutUser}
            className="cursor-pointer rounded-full border border-slate-700 px-3 py-1 text-slate-200 hover:bg-slate-800"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Mobile controls */}
      <div className="flex items-center gap-3 text-xs md:hidden">
        <span className="max-w-[120px] truncate text-slate-300">
          {user?.email}
        </span>
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="flex cursor-pointer h-8 w-8 items-center justify-center rounded-md border border-slate-700 text-slate-200 hover:bg-slate-800"
          aria-label="Toggle navigation"
        >
          <span className="flex flex-col gap-[3px]">
            <span className="block h-[2px] w-4 rounded bg-slate-200" />
            <span className="block h-[2px] w-4 rounded bg-slate-200" />
            <span className="block h-[2px] w-4 rounded bg-slate-200" />
          </span>
        </button>
      </div>

      {menuOpen && (
        <div className="absolute top-12 right-4 mx-auto z-20 border border-slate-800 bg-slate-900 px-4 py-4 md:hidden rounded-lg w-[250px]">
          <div className="flex flex-col gap-3 text-sm">
            <NavLinks onClick={() => setMenuOpen(false)} />
            <button
              onClick={() => {
                setMenuOpen(false);
                signOutUser();
              }}
              className="mt-2 w-full cursor-pointer rounded-full border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;