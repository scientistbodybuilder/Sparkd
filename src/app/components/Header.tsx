"use client";
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from "@/lib/auth-context";
import Link from 'next/link'

const Header = () => {
    const { user, signOutUser } = useAuth();
    const pathname = usePathname();
    if ((pathname.includes('quiz') && !pathname.includes('results')) || pathname === ('/')) {
      return null
    } 

    return(
        <header className="flex relative items-center justify-end border-b border-slate-800 h-16 px-6 py-4 w-full bg-slate-950 box-border gap-4 md:gap-8">
        <div className="absolute left-3">
          <h1 className="text-lg md:text-xl font-semibold text-white">Sparkd</h1>
          {/* <p className="text-xs text-slate-400">
            Generated with Gemini from your PDFs.
          </p> */}
        </div>

        <div className='flex gap-4 text-xs md:text-sm'>
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
              href="/scores"
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
            className="rounded-full cursor-pointer border border-slate-700 px-3 py-1 text-slate-200 hover:bg-slate-800"
          >
            Sign out
          </button>
        </div>
      </header>
    )
}

export default Header