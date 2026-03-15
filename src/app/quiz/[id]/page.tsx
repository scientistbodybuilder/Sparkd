"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { firestore, firebaseCollections, type Quiz } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import bg from '../../assets/backgrounds/game_bg_1.jpg'
// import PauseIcon from '@mui/icons-material/Pause';
// import VolumeUpIcon from '@mui/icons-material/VolumeUp';
// import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import { Pause, VolumeUp, RecordVoiceOver } from '@mui/icons-material';

import SpriteAnimator , { SpriteAnimatorHandle} from "@/app/animations/SpriteAnimator";
//services
import { saveQuiz } from '../../services/quiz.services'

//modals
import AudioModal from '../../components/AudioRecordingModal'
import PauseModal from '../../components/PauseModal'

type LocalQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
};

export default function QuizPlayPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading } = useAuth();
  const bRef = useRef<SpriteAnimatorHandle | null>(null);
  const audioHurtRef = useRef<HTMLAudioElement | null>(null);
  const audioSlashRef = useRef<HTMLAudioElement | null>(null);
  const audioBGRef = useRef<HTMLAudioElement | null>(null);

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attackPoints, setAttackPoints] = useState(1)
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [maxHealth, setMaxHealth] = useState<number>(0);
  const [playerHealth, setPlayerHealth] = useState<number>(0);
  const [enemyHealth, setEnemyHealth] = useState<number>(0);

  //modal control
  const [openEndModal, setOpenEndModal] = useState(false);
  const [openPauseModal, setOpenPauseModal] = useState(true);
  const [openAudioModal, setOpenAudioModal] = useState(false);

  //sounds
  const playHurtSound = () => {
    if (audioHurtRef.current) {
      audioHurtRef.current.currentTime = 0;
      audioHurtRef.current.play();
    }
  };

  const playSlashSound = () => {
    if (audioSlashRef.current) {
      audioSlashRef.current.currentTime = 0;
      audioSlashRef.current.play();
    }
  };

  const speak = (q: LocalQuestion) => {
    let text = q.question;
    q.options.forEach((option, index) => {
      let letter;
      switch (index) {
        case 0:
          letter = 'A'
          break
        case 1:
          letter = 'B'
          break
        case 2:
          letter = 'C'
          break
        case 3:
          letter = 'D'
          break
      }
      text += ` Option ${letter}: ${option}`;
    });

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;  // Speed of speech (1 is normal, 0.5 is slower, 2 is faster)
    utterance.pitch = 1; // Pitch of the voice (0 is low, 2 is high)
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  }

  const onConfirm = async (ans: number) => {
    setOpenAudioModal(false)
    console.log('answer received from audio: ',ans)
    await handleAnswer(ans)
  }

  const onCancel = () => {
    setOpenAudioModal(false)
  }

  const unPause = () => {
    setOpenPauseModal(false)
    if (audioBGRef.current) {
      audioBGRef.current.play()
    }
  }

  const pauseSave = async () => {
    if(!user || !quiz) return false
    const result = await saveQuiz(user.uid, quiz, score, quiz.questions.length);
    if (result.success) {
      return true
    } else {
      return false
    }
  }

  useEffect(() => {
    audioHurtRef.current = new Audio('/sounds/enemy_hurt_sound.mp3');
    audioSlashRef.current = new Audio('/sounds/enemy_slash_sound.mp3');
    audioBGRef.current = new Audio('/sounds/bg-sound.mp3');
    audioBGRef.current.loop = true
    audioBGRef.current.volume = 0.3
  }, []);

  useEffect(() => {
    if (!user || !params?.id) return;
    const load = async () => {
      const ref = doc(firestore, "users", user.uid, "quizzes", params.id);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        router.replace("/dashboard");
        return;
      }
      const raw = snap.data() as any;
      const q: Quiz = {
        id: snap.id,
        title: raw.title,
        createdAt: raw.createdAt,
        lastScore: raw.lastScore ?? undefined,
        totalQuestions: raw.totalQuestions ?? (raw.questions?.length ?? 0),
        questions: (raw.questions ?? []).map((q: any, idx: number) => ({
          id: String(idx),
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
        })) as LocalQuestion[],
      };
      setQuiz(q);
      setPlayerHealth(q?.questions.length || 0);
      setEnemyHealth(q?.questions.length || 0);
      setMaxHealth(q?.questions.length || 0);
    };
    load();
  }, [user, params?.id, router]);

  if (loading || !user || !quiz) {
    return (
      <div className="flex flex-1 items-center justify-center bg-slate-950 text-slate-200">
        Loading quiz...
      </div>
    );
  }

  const current = quiz.questions[currentIndex] as LocalQuestion | undefined;


  const handleAction = (ani: string) => {
        if (bRef.current) {
        bRef.current.updateAnimation(ani); // call function inside B
        }
    };

  const handleAnswer = async (optionIndex: number) => {
    if (!current) return;

    const isCorrect = optionIndex === current.correctIndex;
    //animation
    if (isCorrect) {
      playHurtSound()
      setEnemyHealth(Math.max(enemyHealth - attackPoints,0))
      handleAction('hurt');
    } else {
      playSlashSound()
      setPlayerHealth(Math.max(playerHealth - attackPoints,0))
      handleAction('attack');
    }

    //update
    setScore((s) => s + (isCorrect ? 1 : 0));
    setAnswers((prev) => {
      const copy = [...prev];
      copy[currentIndex] = optionIndex;
      return copy;
    });

    const isLast = currentIndex === quiz.questions.length - 1;
    if (isLast) {
      setSubmitting(true);
      // Save score to Firestore then go to results
      await saveQuiz(user.uid, quiz, score, quiz.questions.length);
      // Update lastScore on quiz doc
      const quizRef = doc(firestore, "users", user.uid, "quizzes", quiz.id);
      await updateDoc(quizRef, {
          lastScore: isCorrect ? score + 1 : score,
      })
      if (audioBGRef.current) {
        audioBGRef.current.pause()
      }
      router.push(`/quiz/${quiz.id}/results`);
      return;
    }

    setCurrentIndex((i) => i + 1);
  };

  return (
    <div className="flex min-h-screen flex-col text-slate-50" style={{ backgroundImage: `url(${bg.src})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      {/* Game HUD / header */}
      {openAudioModal && <AudioModal onConfirm={onConfirm} onCancel={onCancel} />}
      {openPauseModal && <PauseModal unPause={unPause} score={score} saveQuizProgress={pauseSave} />}
      
      <header className="flex items-center justify-between border-b bg-slate-900 border-slate-800 px-6 py-4 text-xs">
        <div>
          <h1 className="text-base md:text-lg font-semibold truncate">{quiz.title}</h1>
          <p className="text-xs md:text-sm text-slate-400">
            Question {currentIndex + 1} of {quiz.questions.length}
          </p>
        </div>

        <div className='flex items-center justify-center gap-3 h-auto'>
          <button onClick={() => speak(current!)} className="bg-yellow-700 hover:bg-yellow-600 cursor-pointer border-slate-600 hover:border-slate-500 py-2 px-4 rounded-xl flex items-center gap-2">
            <p className='font-bold text-sm md:text-base text-white'>READ</p>
            <VolumeUp  />
          </button>

          <button onClick={() => setOpenAudioModal(true)} className="bg-green-800 hover:bg-green-600 cursor-pointer border-slate-600 hover:border-slate-500 py-2 px-4 rounded-xl flex items-center gap-2">
             <p className='font-bold text-sm md:text-base text-white'>ANSWER</p>
             <RecordVoiceOver />
          </button>

        <div className="flex items-center gap-3">
          <span className="rounded-full border border-slate-700 px-3 py-1 font-medium text-xs md:text-sm text-emerald-400">
            Score: {score}
          </span>
        </div>
        </div>
        
      </header>

      {/* Main game area */}
      <main className="relative flex flex-1 flex-col items-center justify-center px-4 py-8">
        {/* Placeholder: main game animation layer */}
        <div className="pointer-events-none absolute inset-0">
          {/* TODO: Add animated background / particles / transitions here */}
        </div>

        {/* Foreground question card */}
        <div className="absolute z-10 left-4 top-4 w-[600px] max-w-[90%] rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl">
          {/* Placeholder: question transition animation wrapper */}
          {/* TODO: Wrap question + options in animated container for slide/fade effects */}
          <h2 className="mb-6 text-sm md:text-base font-semibold">
            {current?.question}
          </h2>

          <div className="grid gap-3">
            {current?.options.map((opt, idx) => (
              <button
                key={idx}
                disabled={submitting}
                onClick={() => handleAnswer(idx)}
                className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-left text-sm hover:border-slate-500 hover:bg-slate-800"
              >
                <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs md:text-sm text-slate-200">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1 text-xs md:text-sm">{opt}</span>
              </button>
            ))}
          </div>
        </div>

        <div className='h-auto w-11/12 flex items-center justify-center mt-48 lg:mt-40 xl:mt-28'>
            <SpriteAnimator ref={bRef} fps={12} end={()=>setOpenEndModal(true)}/>
        </div>
        <div className='absolute bottom-24 right-4' onClick={()=>{
          setOpenPauseModal(true)
          if (audioBGRef.current) {
            audioBGRef.current.pause()
          }
          }}>
          <Pause className='text-white cursor-pointer' fontSize="large" />
        </div>

        {quiz && (<div className='w-full absolute bottom-0 h-20 flex items-center justify-between border-t bg-slate-900 border-slate-800 px-6 py-6'>
            <div className='w-1/2 flex flex-col items-start gap-2'>
                    <h3 className='text-base xl:text-lg font-medium text-white'>Player Health</h3>
                    <div className='h-7 xl:h-8 w-2/3 rounded-sm relative mb-2'>
                        <div className='absolute h-full w-full bg-red-700 rounded-md'></div>
                        <div className={`absolute h-full z-10 bg-green-400 rounded-tl-md rounded-bl-md transition-all duration-300 ${playerHealth == quiz.questions.length ? 'rounded-tr-md rounded-br-md' : ''}`} style={{width: `${(playerHealth / maxHealth) * 100}%`}}></div>
                    </div>
                </div>

                <div className='w-1/2 flex flex-col items-end gap-2'>
                    <h3 className='text-base xl:text-lg font-medium text-white'>Enemy Health</h3>
                    <div className='h-7 xl:h-8 w-2/3 rounded-sm relative mb-2 flex justify-end'>
                        <div className='absolute h-full w-full bg-red-700 rounded-md'></div>
                        <div className={`absolute h-full z-10 bg-green-400 rounded-tr-md rounded-br-md transition-all duration-300 ${enemyHealth == quiz.questions.length ? 'rounded-tl-md rounded-bl-md' : ''}`} style={{width: `${(enemyHealth / maxHealth) * 100}%`}}></div>
                    </div>
                </div>

        </div>)}
      </main>
    </div>
  );
}

