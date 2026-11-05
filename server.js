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
      return res.status(500).json({ error: 'Gemini API kaliti topilmadi' })
    }

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'Xabarlar noto‘g‘ri' })
    }

    const contents = messages
      .filter((m, i) => !(i === 0 && m.role === 'assistant'))
      .filter(m => ['user', 'assistant'].includes(m.role))
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(m.content || '') }]
      }))

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7
          }
        })
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || 'Gemini xatoligi'
      })
    }

    const reply = data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || '')
      .join('') || ''

    return res.json({ reply })
  } catch (error) {
    return res.status(500).json({ error: 'Serverda xatolik: ' + error.message })
  }
})

app.use(express.static(path.join(__dirname, 'dist')))

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
  console.log('UzAI Gemini bilan ishga tushdi')
})
