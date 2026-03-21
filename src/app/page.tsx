"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { userSignIn } from '../app/services/auth.services'
import SignIn from './auth/signin'
import SignUp from './auth/signup'
import { Sign } from "crypto";

export default function Home() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [selected, setSelected] = useState("sign-in");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    userSignIn(email, password);
  }

  // useEffect(() => {
  //   if (!loading && user) {
  //     router.replace("/dashboard");
  //   }
  // }, [user, loading, router]);


  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 relative">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl">
        <div className="mb-8 space-y-2 text-center">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Sparkd
          </h1>
          <p className="text-sm text-slate-300">
            Sparkd is a platform that allows you to create gamified quizzes from your PDFs.
          </p>
        </div>
        {/* <button
          onClick={signInWithGoogle}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
        >
          <span>Continue with Google</span>
        </button> */}
        <div className='space-y-2 flex flex-col items-center justify-center'>
          <div className='flex items-center justify-evenly w-full mb-4'>
            <p className={`font-semibold text-base text-${selected === 'sign-in' ? 'white' : 'slate-300'} cursor-pointer`} onClick={() => setSelected('sign-in')}>
              Sign in
            </p>
            <p className={`font-semibold text-base text-${selected === 'sign-up' ? 'white' : 'slate-300'} cursor-pointer`} onClick={() => setSelected('sign-up')}>
              Sign up
            </p>
          </div>
          {selected === 'sign-in' && (
            <SignIn />
          )}
          {selected === 'sign-up' && (
            <SignUp />
          )}
        </div>

        
        
        {!loading && !user && (
          <p className="mt-4 text-center text-xs text-slate-400">
            You&apos;ll be redirected to your dashboard after signing in.
          </p>
        )}
      </div>
      <img src='/animations/Enemy_wave.png' className='absolute bottom-0 left-0 w-96 h-96 object-cover'/>
      <img src='/animations/Enemy_wave_2.png' className='absolute bottom-0 right-0 w-96 h-96 object-cover'/>
    </div>
  );
}
