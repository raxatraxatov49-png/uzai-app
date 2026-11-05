import { useState, useEffect, useRef } from 'react'

const tg = window.Telegram?.WebApp
tg?.ready()
tg?.expand()

export default function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Salom! Men UzAI 🤖 Sizga qanday yordam beray?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    const updated = [...messages, { role: 'user', content: text }]
    setMessages(updated)
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Xatolik yuz berdi')

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.reply }
      ])
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Xatolik: ' + error.message }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="app">
      <header className="header">
        <div className="logo">U</div>
        <div>
          <h1>UzAI</h1>
          <p>Sun’iy intellekt yordamchingiz</p>
        </div>
        <span className="online">● Online</span>
      </header>

      <section className="chat">
        {messages.map((message, index) => (
          <div className={`message ${message.role}`} key={index}>
            {message.content}
          </div>
        ))}
        {loading && <div className="message assistant">UzAI yozmoqda...</div>}
        <div ref={bottomRef} />
      </section>

      <form className="input-area" onSubmit={sendMessage}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="UzAI ga xabar yozing..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          ➤
        </button>
      </form>
      <footer>UzAI • Sizning aqlli yordamchingiz</footer>
    </main>
  )
}
