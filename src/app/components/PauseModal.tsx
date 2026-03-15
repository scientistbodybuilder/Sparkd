import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type PauseModalProps = {
    unPause: () => void;
    saveQuizProgress: () => Promise<boolean>;
    score: number;
}
const PauseModal = ({ unPause, score, saveQuizProgress }: PauseModalProps) => {
    const router = useRouter()
    const [quizSaved, setQuizSaved] = useState<boolean | null>(null)
    const [loading, setLoading] = useState(false)
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // Only close if the clicked element is the overlay itself
        if (e.target === e.currentTarget) {
            unPause();
        }
    };

    const exitQuiz = async () => {
        try {
            setLoading(true)
            const res = await saveQuizProgress();
            if (res) {
                setQuizSaved(true)
                setTimeout(() => {
                    router.push("/dashboard")
                }, 1000)
            } else {
                setQuizSaved(false)
            }
        } catch (err) {
            setQuizSaved(false)
        } finally {
            setLoading(false)
        }
        
    }


    return(
        <>
            <div className="overlay" onClick={handleOverlayClick}></div>
            <div className='w-[400px] h-[400px] bg-slate-800 border border-slate-200 p-4 flex flex-col gap-4 items-center justify-center fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl'>
                <p className='text-white text-lg xl:text-2xl font-bold'>Game Paused</p>
                <h3 className="text-white text-xl">Current Score: {score ? score : 0}</h3>
                {loading && <p className='text-white text-xs md:text-sm'>Saving quiz...</p>}
                {quizSaved === true && <p className="text-green-400 text-xs md:text-sm">Quiz saved successfully!</p>}
                {quizSaved === false && <p className='text-red-500 text-xs md:text-sm'>Could not save quiz</p>}
                <div className='flex items-center justify-center  gap-4'>
                    <button onClick={unPause} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-xl cursor-pointer">
                        Resume
                    </button>
                    <button onClick={()=>exitQuiz()} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-xl cursor-pointer">
                        Exit
                    </button>
                </div>
            </div>
        </>
    )

}

export default PauseModal