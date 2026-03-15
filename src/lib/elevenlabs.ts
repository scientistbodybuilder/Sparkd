import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'
import axios from 'axios'

if (!process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY) {
  console.warn("NEXT_PUBLIC_ELEVENLABS_API_KEY is not set. ElevenLabs API calls will fail.");
}
export const elevenlabs = new ElevenLabsClient({
    apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY
})


