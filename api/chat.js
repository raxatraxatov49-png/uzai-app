export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Faqat POST so‘rovi mumkin' })
  }

  try {
    const { messages } = req.body || {}

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'Xabarlar noto‘g‘ri' })
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OPENAI_API_KEY sozlanmagan' })
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
        error: data.error?.message || 'AI bilan bog‘lanishda xatolik'
      })
    }

    return res.status(200).json({
      reply: data.choices?.[0]?.message?.content || ''
    })
  } catch (error) {
    return res.status(500).json({ error: 'Serverda xatolik yuz berdi' })
  }
}
