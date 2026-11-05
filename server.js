import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const app = express()
const __dirname = path.dirname(fileURLToPath(import.meta.url))

app.use(express.json({ limit: '10mb' }))

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body || {}

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'Xabarlar noto‘g‘ri' })
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'API kaliti sozlanmagan' })
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7
      })
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || 'AI xatoligi'
      })
    }

    res.json({ reply: data.choices?.[0]?.message?.content || '' })
  } catch (error) {
    res.status(500).json({ error: 'Serverda xatolik' })
  }
})

app.use(express.static(path.join(__dirname, 'dist')))

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
  console.log('UzAI ishga tushdi')
})
