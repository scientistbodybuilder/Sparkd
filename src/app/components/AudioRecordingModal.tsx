import { useState, useEffect, useRef } from "react";
import axios from "axios";

const MAX_DURATION = 10;
const TRANSCRIBE_TIMEOUT_MS = 10000;
type AudioRecorderProps = {
    onConfirm: (a: number) => void;
    onCancel: () => void;
}
type Answer = {
    label: string;
    value: number;
}
const AudioRecordingModal = ({ onConfirm, onCancel }: AudioRecorderProps) => {

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const [elapsed, setElapsed] = useState(0);
    const [isRecording, setIsRecording] = useState(true);
    const [currentAnswer, setCurrentAnswer] = useState<Answer | null>(null);
    const [validAnswer, setValidAnswer] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const circumference = 2 * Math.PI * 50;
    const progress = Math.min(elapsed / MAX_DURATION, 1);
    const strokeOffset = circumference * (1 - progress);
    const strokeColor = progress < 0.6 ? '#22c55e' : progress < 0.85 ? '#f59e0b' : '#ef4444';

    const transcribeWithTimeout = async (formData: FormData): Promise<string> => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                controller.abort();
            }, TRANSCRIBE_TIMEOUT_MS);

            const response = await axios.post('/api/speech-to-text', formData, {
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            const strippedText = response.data.text.replace(/[^a-zA-Z]/g, '').toUpperCase();
            return strippedText as string;
        } catch (err) {
            console.error('Speech-to-text timeout or error:', err);
            return "unknown";
        }
    };

    useEffect(() => {
        if (!isRecording) return;
        intervalRef.current = setInterval(() => {
            setElapsed(prev => {
                if (prev >= MAX_DURATION) {
                    clearInterval(intervalRef.current!);
                    handleConfirm();
                    return prev;
                }
                return parseFloat((prev + 0.1).toFixed(1));
            });
        }, 100);
        return () => clearInterval(intervalRef.current!);
    }, [isRecording]);

    useEffect(() => {
        // SSR guard — navigator doesn't exist on the server
        if (typeof window === 'undefined' || !isRecording || !navigator.mediaDevices) return;

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then((stream) => {
                const recorder = new MediaRecorder(stream);
                mediaRecorderRef.current = recorder;

                recorder.ondataavailable = (e) => {
                    if (e.data.size > 0) chunksRef.current.push(e.data);
                };

                recorder.start();
            })
            .catch((err) => {
                // User denied mic permission
                console.error('Microphone access denied:', err);
            });

        return () => {
            mediaRecorderRef.current?.stream.getTracks().forEach(t => t.stop());
        };
    }, [isRecording]);

    const handleConfirm = async () => {
        if (!mediaRecorderRef.current) return;
        setIsRecording(false);
        clearInterval(intervalRef.current!);
        mediaRecorderRef.current.onstop = async () => {
            const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
            chunksRef.current = [];  // clear chunks for next recording
            const formData = new FormData();
            formData.append('audio', blob);

            const answer = await transcribeWithTimeout(formData);
            console.log('Speech-to-text answer:', answer);
            switch (answer) {
                case "A":
                    setCurrentAnswer({ label: "A", value: 0 })
                    break
                case "B":
                    setCurrentAnswer({ label: "B", value: 1 })
                    break
                case "C":
                    setCurrentAnswer({ label: "C", value: 2 })
                    break
                case "D":
                    setCurrentAnswer({ label: "D", value: 3 });
                    break
                default:
                    setCurrentAnswer({ label: "Unknown", value: -1 });
            }

            const availableAnswers = ["A", "B", "C","D"];
            if (availableAnswers.includes(answer)) {
                // ask them to confirm what we think is the answer
                setValidAnswer(true);
                setErrors({});
            } else {
                // ask them to try again
                setErrors({ ...errors, audio: "Please try again." });
            }

        };

        mediaRecorderRef.current.stop();
    };

    const handleSubmit = () => {
        if (!currentAnswer) return;
        onConfirm(currentAnswer.value)
    }
    
    const handleRetry = () => {
        // Implementation for retrying the recording
        setCurrentAnswer(null)
        setElapsed(0)
        setIsRecording(true)
    }

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // Only close if the clicked element is the overlay itself
        if (e.target === e.currentTarget) {
            onCancel();
        }
    };


    return(
        <>
        <div className='overlay' onClick={handleOverlayClick}></div>
        <div className='w-[400px] h-[400px] bg-slate-800 border border-slate-200 p-4 flex flex-col items-center justify-center fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl'>
                <div className="flex flex-col gap-2 items-center justify-center mb-4">
                    <span className="text-xl md:text-2xl font-semibold text-white">Recording...</span>
                    {!isRecording && currentAnswer && currentAnswer.label !== "Unknown" ? <p className="text-white text-center">Is your answer {currentAnswer.label}?</p> : 
                    !isRecording && currentAnswer ? <p className="text-white text-center">Could not understand your answer. Please try again.</p> :
                    !isRecording ? <p className="text-white text-center">Getting your answer...</p> : <p className="text-white text-center">Say the letter. For example, say "A"</p>}

                    <div className="relative w-[120px] h-[120px]">
                    <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="60" cy="60" r="50" fill="none" stroke="#334155" strokeWidth="8"/>
                        <circle
                            cx="60" cy="60" r="50"
                            fill="none"
                            stroke={strokeColor}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeOffset}
                            style={{ transition: 'stroke-dashoffset 0.1s linear, stroke 0.3s ease' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-semibold text-white">{elapsed.toFixed(1)}s</span>
                        <span className="text-xs text-slate-400">/ 10s</span>
                    </div>
                </div>
                </div>
                {isRecording && (<div className="flex w-full items-center justify-evenly">
                    <button onClick={()=>handleConfirm()} className="rounded-xl px-4 py-2 bg-green-700 hover:bg-green-600 cursor-pointer border-2 border-slate-400">
                        <span className="text-white font-semibold text-base md:text-lg">Confirm</span>
                    </button>
                    <button className="rounded-xl px-4 py-2 bg-orange-700 hover:bg-orange-600 cursor-pointer border-2 border-slate-400" onClick={onCancel}>
                        <span className="text-white font-semibold text-base md:text-lg">Cancel</span>
                    </button>
                </div>)}
                {!isRecording && (
                    <div className="flex w-full items-center justify-evenly">
                        <button onClick={()=>handleSubmit()} disabled={!validAnswer} className="rounded-xl px-4 py-2 bg-green-700 hover:bg-green-600 cursor-pointer border-2 border-slate-400">
                            <span className="text-white font-semibold text-base md:text-lg">Submit</span>
                        </button>
                        <button onClick={()=>handleRetry()} className="rounded-xl px-4 py-2 bg-orange-700 hover:bg-orange-600 cursor-pointer border-2 border-slate-400">
                            <span className="text-white font-semibold text-base md:text-lg">Retry</span>
                        </button>
                    </div>

                )}
        </div>
        </>
        
    )
}

export default AudioRecordingModal