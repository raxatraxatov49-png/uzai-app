
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const app = express()
const __dirname = path.dirname(fileURLToPath(import.meta.url))

app.use(express.json({ limit: '10mb' }))

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body || {}
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return res.status(500).json({
        error: 'Gemini API kaliti topilmadi'
      })
    }

    if (!Array.isArray(messages)) {
      return res.status(400).json({
        error: 'Xabarlar noto‘g‘ri'
      })
    }

    const contents = messages
      .filter((m, i) => !(i === 0 && m.role === 'assistant'))
      .filter(m => ['user', 'assistant'].includes(m.role))
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(m.content || '') }]
      }))

    if (contents.length === 0) {
      return res.status(400).json({
        error: 'Xabar bo‘sh'
      })
    }

    console.log('Gemini so‘rov qabul qilindi')

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048
          }
        }),
        signal: AbortSignal.timeout(30000)
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('Gemini API xatosi:', data)

      return res.status(response.status).json({
        error: data.error?.message || 'Gemini API xatosi'
      })
    }

    const reply = data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || '')
      .join('') || ''

    if (!reply) {
      return res.status(500).json({
        error: 'Gemini javob qaytarmadi'
      })
    }

    console.log('Gemini javobi tayyor')

    return res.json({ reply })

  } catch (error) {
    console.error('Server xatosi:', error)

    if (
      error.name === 'TimeoutError' ||
      error.name === 'AbortError'
    ) {
      return res.status(504).json({
        error: 'Gemini juda uzoq kutdi. Qayta urinib ko‘ring.'
      })
    }

    return res.status(500).json({
      error: 'Serverda xatolik: ' + error.message
    })
  }
})

app.use(express.static(path.join(__dirname, 'dist')))

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
  console.log('UzAI Gemini 2.5 Flash bilan ishga tushdi')
})
