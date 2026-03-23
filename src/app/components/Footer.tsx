"use client";

import { usePathname } from "next/navigation";

const Footer = () => {
  const pathname = usePathname();

  if ((pathname.includes("quiz") && !pathname.includes("results")) || pathname === "/") {
    return null;
  }

  return (
    <footer className="mt-auto flex h-16 relative w-full items-center justify-center border-t border-slate-800 bg-slate-950 px-6 text-[10px] md:text-xs text-slate-500">
      <span>
        Sparkd · Turn your PDFs into gamified quizzes.
      </span>
      {/* <img src='/animations/Enemy_wave.png' className='absolute bottom-0 left-0 w-96 h-96 object-cover'/>
      <img src='/animations/Enemy_wave_2.png' className='absolute bottom-0 right-0 w-96 h-96 object-cover'/> */}
    </footer>
  );
};

export default Footer;

