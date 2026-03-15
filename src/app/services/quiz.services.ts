import { auth, firestore } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore'
import { PDFParse} from 'pdf-parse'

interface Question {
    question: string;
    correctIndex: number;
    options: string[];
}

export const createQuiz = async (userId: string, questions: any[]) => {

}

export const parsePdf = async (buffer: Buffer): Promise<string> => {
    try {
        const parser = new PDFParse({ data: buffer });
    
        const result = await parser.getText();
        console.log(result.text);
        return result.text;
    } catch (err) {
        console.error('Error parsing PDF:', err);
        return ''
    }
    
}

export const saveQuiz = async (userId: string, quiz: any, finalScore: number, total: number) => {
    try {
        const scoresRef = collection(firestore, 'users', userId, 'scores')
        const q = query(scoresRef, where('quizId', '==', quiz.id))
        const existing = await getDocs(q)

        if (!existing.empty) {
            // Update the existing document
            const existingDoc = existing.docs[0]
            await setDoc(doc(scoresRef, existingDoc.id), {
                quizId: quiz.id,
                quizTitle: quiz.title,
                score: finalScore,
                total,
                createdAt: serverTimestamp(),
            })
        } else {
            // Create a new one
            await addDoc(scoresRef, {
                quizId: quiz.id,
                quizTitle: quiz.title,
                score: finalScore,
                total,
                createdAt: serverTimestamp(),
            })
        }
        return { success: true}
    } catch (err) {
        console.log('error saving quiz: ',err)
        return {
            success: false
        }
    }
    
}