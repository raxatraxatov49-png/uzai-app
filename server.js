import express from 'express'
import { createServer } from 'vite'

const app = express()
app.use(express.json({ limit: '10mb' }))

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'spa'
})

app.use(vite.middlewares)

app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
  console.log('UzAI server ishga tushdi')
})
