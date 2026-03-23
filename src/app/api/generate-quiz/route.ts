import { NextRequest, NextResponse } from "next/server";
import { storage, firestore, firebaseCollections } from "@/lib/firebase";
import { parsePdf } from '../../services/quiz.services'
import { generateQuizFromPdfText } from "@/lib/gemini";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req: NextRequest) {
  try {
    console.log('Request received');
    const formData = await req.formData();

    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string | null;
    const comprehensionLevel = formData.get("comprehensionLevel") as string | null;
    const fileName = file.name

    // console.log('file:', file);
    // console.log('comprehensionLevel:', comprehensionLevel);

    if (!file || !comprehensionLevel) {
      return NextResponse.json(
        { error: "Missing file or comprehension level" },
        { status: 400 }
      );
    }

    // NOTE: In a real app you'd verify auth on the server (e.g. via cookies or headers)
    // Here we expect userId to be provided from the client; you can wire this to
    // Firebase ID token verification as a follow-up.
    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 401 }
      );
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    console.log('got thhe buffer')
    const text = await parsePdf(buffer)
    // console.log('got the text extracted: ',text)
    console.log('calling gemini now')
    const questions = await generateQuizFromPdfText(text,comprehensionLevel);
    if (!questions) {
      return NextResponse.json(
        { error: "Failed to generate quiz questions" },
        { status: 500 }
      );
    }
    // console.log('created the questions: ',questions)
    const quizzesRef = firebaseCollections.userQuizzes(userId);
    const quizId = doc(quizzesRef).id;

    await setDoc(doc(quizzesRef, quizId), {
      title: fileName.replace(/\.pdf$/i, ""),
      createdAt: serverTimestamp(),
      lastScore: null,
      totalQuestions: questions.length,
      questions: questions.map((q) => ({
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
      })),
    });

    return NextResponse.json({ quizId , success: true}, { status: 200 });
  } catch (error: any) {
    console.error("Error generating quiz:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate quiz", success: false },
      { status: 500 }
    );
  }
}


