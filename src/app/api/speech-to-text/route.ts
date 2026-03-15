import { NextRequest, NextResponse } from "next/server";
import { elevenlabs } from '../../../lib/elevenlabs'

export async function POST(request: NextRequest) {
    console.log('calling elvenlabs')
    try {
        const formData = await request.formData()
        const audio = formData.get('audio') as Blob
        const file = new File([audio], 'recording.webm', { type: 'audio/webm' })
        const transcription = await elevenlabs.speechToText.convert({
            file: file,
            modelId: 'scribe_v2',
        })

        return NextResponse.json({ text: transcription.text })
    } catch (error) {
        console.error('Error occurred:', error)
        return NextResponse.json({ error: 'Failed to convert speech to text' }, { status: 500 })
    }
}