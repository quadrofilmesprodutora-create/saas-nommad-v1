import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const PREVIEW_MODE =
  !process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'placeholder'

const PREVIEW_TRANSCRIPT =
  'Começei tocando techno no quarto com 16 anos, hoje tenho 22 mil ouvintes no Spotify mas sinto que tô ' +
  'travado em conteúdo. Minha vontade é tocar no D-Edge e ter presença real na cena eletrônica brasileira, ' +
  'mas tô perdendo tempo com posts que não representam quem eu sou. Preciso de um norte pra parar de me diluir.'

const groq = PREVIEW_MODE ? null : new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const audio = form.get('audio')

    if (!audio || !(audio instanceof Blob)) {
      return NextResponse.json({ error: 'audio required' }, { status: 400 })
    }

    if (PREVIEW_MODE || !groq) {
      return NextResponse.json({ text: PREVIEW_TRANSCRIPT, _preview: true })
    }

    // Groq Whisper
    const file = new File([audio], 'audio.webm', { type: audio.type })
    const transcription = await groq.audio.transcriptions.create({
      file,
      model: 'whisper-large-v3',
      language: 'pt',
      response_format: 'json',
    })

    return NextResponse.json({ text: transcription.text })
  } catch (err) {
    console.error('[transcribe]', err)
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 })
  }
}
