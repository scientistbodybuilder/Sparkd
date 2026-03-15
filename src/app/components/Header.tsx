"use client";
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from "@/lib/auth-context";
import Link from 'next/link'

const Header = () => {
    const { user, signOutUser } = useAuth();
    const pathname = usePathname();
    if (pathname.includes('quiz') || pathname === ('/')) {
      return null
    } 

    return(
        <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4 w-full bg-slate-950 box-border">
        <div>
          <h1 className="text-lg font-semibold text-white">Sparkd</h1>
          <p className="text-xs text-slate-400">
            Generated with Gemini from your PDFs.
          </p>
        </div>

        <div className='flex gap-4 text-sm'>
            <Link
              href="/dashboard"
              className="text-slate-300 hover:text-white"
            >
              Dashboard
            </Link>
            <Link
              href="/upload"
              className="text-slate-300 hover:text-white"
            >
                Upload
            </Link>
            <Link
              href="/score"
              className="text-slate-300 hover:text-white"
            >
              Score
            </Link>

        </div>




        <div className="flex items-center gap-3 text-xs">
          <span className="max-w-[160px] truncate text-slate-300">
            {user?.email}
          </span>
          <button
            onClick={signOutUser}
            className="rounded-full border border-slate-700 px-3 py-1 text-slate-200 hover:bg-slate-800"
          >
            Sign out
          </button>
        </div>
      </header>
    )
}

export default Header