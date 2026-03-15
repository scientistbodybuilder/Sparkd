"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ref, uploadBytes } from "firebase/storage";
import { storage, firebaseCollections, firestore } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { addDoc, serverTimestamp } from "firebase/firestore";
import axios from 'axios'

export default function UploadPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comprehensionLevel, setComprehensionLevel] = useState<string>("kindergarten");
  const [quizGenerated, setQuizGenerated] = useState<boolean | null>(null);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-200">
        Loading...
      </div>
    );
  }

  const handleSelector = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setComprehensionLevel(e.target.value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', user.uid)
      formData.append('comprehensionLevel', comprehensionLevel)
      const res = await axios.post('/api/generate-quiz', formData);


      if (res.status >= 200 && res.status < 300) {
        if (res.data.success) {
          console.log('Quiz generated successfully');
          router.push("/dashboard");
        } else {
          setQuizGenerated(false)
        }
        
      } else {
        setQuizGenerated(false)
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl">
        <h1 className="mb-2 text-lg font-semibold text-white">Upload PDF</h1>
        <p className="mb-6 text-xs text-slate-300">
          We&apos;ll send this PDF to Gemini to generate quiz.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-200">
              Select PDF
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => {
                const f = e.target.files?.[0];
                setFile(f ?? null);
              }}
              className="mt-1 w-full text-xs text-slate-300 file:mr-4 file:rounded-full file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-xs file:font-medium file:text-slate-900 hover:file:bg-white"
            />
            <label className="text-xs font-medium text-slate-200">
              Select Comprehension Level
            </label>
            <select onChange={handleSelector} className="focus:outline-none mt-1 p-2 w-full rounded-md border border-slate-600 bg-slate-800 text-xs text-slate-300">
              <option value="beginner">Kindergarten</option>
              <option value="grade 1">Grade 1</option>
              <option value="grade 2">Grade 2</option>
              <option value="grade 3">Grade 3</option>
              <option value="grade 4">Grade 4</option>
              <option value="grade 5">Grade 5</option>
              <option value="grade 6">Grade 6</option>
              <option value="grade 7">Grade 7</option>
              <option value="grade 8">Grade 8</option>
              <option value="grade 9">Grade 9</option>
              <option value="grade 10">Grade 10</option>
              <option value="grade 11">Grade 11</option>
              <option value="grade 12">Grade 12</option>
              <option value="undergraduate">Undergraduate</option>
            </select>
          </div>

          {quizGenerated === false && (
            <p className="text-xs text-red-400">
              Failed to generate quiz
            </p>
          )}

          <button
            type="submit"
            disabled={!file || isUploading}
            className="flex w-full items-center justify-center rounded-full bg-slate-100 py-2 text-xs font-medium text-slate-900 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading ? "Generating quiz..." : "Generate quiz"}
          </button>
        </form>
      </div>
    </div>
  );
}

