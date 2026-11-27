'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, AudioLines, Captions, ChevronDown, Clock3, Mic, MicOff, MoreHorizontal, Pause, Play, Settings2, Volume2, VolumeX, Waves, X } from 'lucide-react'

type Turn = { role: 'interviewer' | 'you'; text: string; time: string }

const questions = [
  { topic: 'Your story', text: 'Let’s start with the big picture. Tell me about a project you’re especially proud of, and what made your contribution meaningful.' },
  { topic: 'System design', text: 'How would you design a service that can reliably process millions of events a day while keeping latency low?' },
  { topic: 'Technical depth', text: 'Tell me about a technical trade-off you made recently. What alternatives did you consider, and how did you measure the result?' },
  { topic: 'Working together', text: 'Describe a time you disagreed with a teammate on an approach. How did you work through it?' },
  { topic: 'Looking ahead', text: 'What kind of problems are you hoping to solve in your next role?' },
]

const initialTurns: Turn[] = [
  { role: 'interviewer', text: 'Hi, I’m Alex, your AI interviewer. Start the voice session when you’re ready. I’ll ask a question, then listen while you answer.', time: 'Ready' },
]

export function InterviewRoom() {
  const [questionIndex, setQuestionIndex] = useState(0)
  const [turns, setTurns] = useState<Turn[]>(initialTurns)
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [muted, setMuted] = useState(false)
  const [paused, setPaused] = useState(false)
  const [started, setStarted] = useState(false)
  const [ended, setEnded] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [notice, setNotice] = useState('')
  const [captionsVisible, setCaptionsVisible] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const transcriptRef = useRef('')
  const silenceTimerRef = useRef<number | null>(null)
  const startedAtRef = useRef<number | null>(null)
  const suppressRecognitionEndRef = useRef(false)

  useEffect(() => {
    if (!started || paused || ended) return
    const timer = window.setInterval(() => setElapsed(Math.floor((Date.now() - (startedAtRef.current ?? Date.now())) / 1000)), 1000)
    return () => window.clearInterval(timer)
  }, [started, paused, ended])

  useEffect(() => () => {
    recognitionRef.current?.stop()
    if (silenceTimerRef.current) window.clearTimeout(silenceTimerRef.current)
    window.speechSynthesis?.cancel()
  }, [])

  const current = questions[questionIndex]
  const elapsedLabel = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`
  const clockTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  function startListening() {
    if (paused || ended) return
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionAPI) {
      setNotice('Voice recognition is not supported in this browser. Try Chrome or Edge with microphone permission enabled.')
      return
    }
    transcriptRef.current = ''
    const recognition = new SpeechRecognitionAPI()
    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.continuous = true
    recognition.onresult = (event) => {
      transcriptRef.current = Array.from(event.results).map((result) => result[0].transcript).join(' ').trim()
      if (silenceTimerRef.current) window.clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = window.setTimeout(() => recognition.stop(), 1500)
    }
    recognition.onerror = () => {
      setListening(false)
      setNotice('Microphone access was interrupted. Allow microphone access and tap the microphone to try again.')
    }
    recognition.onend = () => {
      setListening(false)
      if (silenceTimerRef.current) window.clearTimeout(silenceTimerRef.current)
      if (suppressRecognitionEndRef.current) {
        suppressRecognitionEndRef.current = false
        return
      }
      const spokenAnswer = transcriptRef.current.trim()
      if (spokenAnswer && !ended && !paused) submitAnswer(spokenAnswer)
    }
    recognitionRef.current = recognition
    try {
      recognition.start()
      setListening(true)
      setNotice('')
    } catch {
      setListening(false)
      setNotice('Could not start the microphone. Check browser permissions and try again.')
    }
  }

  function speak(text: string, listenAfter = true) {
    if (muted || !('speechSynthesis' in window)) {
      if (muted) setNotice('Turn audio on to hear the next question.')
      else setNotice('Speech playback is not supported in this browser.')
      if (listenAfter) startListening()
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.96
    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => {
      setSpeaking(false)
      if (listenAfter && !paused && !ended) startListening()
    }
    utterance.onerror = () => {
      setSpeaking(false)
      if (listenAfter && !paused && !ended) startListening()
    }
    window.speechSynthesis.speak(utterance)
  }

  function startInterview() {
    if (started || ended) return
    startedAtRef.current = Date.now()
    setStarted(true)
    setTurns([{ ...initialTurns[0], time: clockTime() }])
    speak(questions[0].text)
  }

  function submitAnswer(text: string) {
    if (!text.trim() || ended) return
    const answer = text.trim()
    const nextIndex = questionIndex + 1
    const isFinalQuestion = nextIndex >= questions.length
    const nextQuestion = questions[Math.min(nextIndex, questions.length - 1)]
    const interviewerReply = isFinalQuestion
      ? 'Thanks for sharing that. That brings us to the end of our conversation.'
      : `Thanks for walking me through that. ${nextQuestion.text}`
    setTurns((existing) => [
      ...existing,
      { role: 'you', text: answer, time: clockTime() },
      { role: 'interviewer', text: interviewerReply, time: clockTime() },
    ])
    setNotice('')
    if (isFinalQuestion) {
      setEnded(true)
      setListening(false)
      window.speechSynthesis?.cancel()
      speak(interviewerReply, false)
      return
    }
    setQuestionIndex(nextIndex)
    speak(nextQuestion.text)
  }

  function toggleMic() {
    if (!started) {
      startInterview()
      return
    }
    if (listening) {
      recognitionRef.current?.stop()
      return
    }
    if (speaking) {
      window.speechSynthesis?.cancel()
      setSpeaking(false)
    }
    startListening()
  }

  function togglePause() {
    if (!started || ended) return
    setPaused((isPaused) => {
      const nextPaused = !isPaused
      if (nextPaused) {
        if (listening) {
          suppressRecognitionEndRef.current = true
          recognitionRef.current?.stop()
        }
        window.speechSynthesis?.pause()
        setListening(false)
      } else if (window.speechSynthesis?.paused) {
        window.speechSynthesis.resume()
      } else if (!speaking) {
        startListening()
      }
      return nextPaused
    })
  }

  function endInterview() {
    setEnded(true)
    setListening(false)
    suppressRecognitionEndRef.current = true
    recognitionRef.current?.stop()
    window.speechSynthesis?.cancel()
  }

  return (
    <main className={`interview-app ${captionsVisible ? 'captions-open' : ''}`}>
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Morrow home"><span className="brand-mark"><AudioLines size={17} /></span><span>morrow<span className="brand-dot">.</span></span></a>
        <div className="session-title"><span className="session-label">VOICE INTERVIEW</span><span className="session-role">Product engineer <ChevronDown size={14} /></span></div>
        <div className="desktop-session-info"><strong>Alex Morgan <span>·</span> AI Interviewer</strong><div><span className="intro-badge">Intro</span><span className={`desktop-live ${ended ? 'session-ended' : ''}`}><i />{ended ? 'Complete' : paused ? 'Paused' : started ? 'Live' : 'Ready'}</span></div></div>
        <button className="icon-button top-settings" aria-label="Interview settings"><Settings2 size={17} /></button>
        <div className="desktop-top-actions"><span className="desktop-timer" aria-label={`Session time ${elapsedLabel}`}>{elapsedLabel}</span><button className={`captions-button ${captionsVisible ? 'captions-active' : ''}`} onClick={() => setCaptionsVisible((value) => !value)} aria-expanded={captionsVisible}><Captions size={18} />{captionsVisible ? 'Close captions' : 'Captions'}</button></div>
        <button className="exit-button" onClick={endInterview} disabled={!started || ended}><X size={15} /><span>End session</span></button>
      </header>

      <div className="room-layout">
        <section className="stage" aria-label="Voice interview in progress">
          <div className="stage-topline"><button className="back-link" onClick={() => setNotice('This practice session stays open while you are here.')}><ArrowLeft size={16} /> Dashboard</button><div className="stage-meta"><span className="live-dot" /> {ended ? 'Session complete' : paused ? 'Paused' : started ? 'Live voice session' : 'Ready when you are'} <span className="meta-separator">/</span> {current.topic}</div><button className="icon-button more-button" aria-label="More options"><MoreHorizontal size={19} /></button></div>
          <div className="interview-content">
            <div className={`voice-scene ${speaking ? 'is-speaking' : ''} ${listening ? 'is-listening' : ''}`} aria-label={listening ? 'Microphone listening' : speaking ? 'Interviewer speaking' : 'Voice interview visualizer'}>
              <div className="scene-glow" />
              <div className="voice-rings"><i /><i /><i /><i /><i /></div>
              <div className="voice-orb"><span className="orb-shine" /><span className="orb-core" /></div>
              <div className="voice-bars" aria-hidden="true">{Array.from({ length: 37 }, (_, index) => <span key={index} style={{ '--bar-index': index } as React.CSSProperties} />)}</div>
            </div>
            <div className="speaker-status"><span className="status-eyebrow"><span className="status-pulse" />{listening ? 'Listening to you' : speaking ? 'AI interviewer speaking' : paused ? 'Session paused' : ended ? 'Interview complete' : started ? 'Your turn to speak' : 'Voice interview'}</span><span className="speaker-name">Alex Morgan <span>·</span> AI interviewer</span></div>

            <div className="question-card">
              <div className="question-top"><span className="question-kicker">QUESTION {String(questionIndex + 1).padStart(2, '0')} <span>/ {String(questions.length).padStart(2, '0')}</span></span><span className="voice-only-tag"><Waves size={13} /> SPEECH TO SPEECH</span></div>
              <h1>{ended ? 'That’s a wrap. Thanks for practicing.' : current.text}</h1>
              <div className="question-bottom"><span><Clock3 size={14} /> {ended ? 'Session complete' : started ? 'Answer out loud; I’ll listen for your response.' : 'Tap the microphone to start. Your interviewer will speak first.'}</span><span className="question-progress">{questionIndex + 1} of {questions.length}</span></div>
            </div>

            <div className="voice-control-card">
              <button className="desktop-mute-button" onClick={() => setMuted((value) => !value)} aria-label={muted ? 'Unmute interviewer audio' : 'Mute interviewer audio'}>{muted ? <VolumeX size={18} /> : <Volume2 size={18} />}<span>{muted ? 'Unmute' : 'Mute'}</span></button>
              <button className={`voice-control ${listening ? 'mic-active' : ''}`} onClick={toggleMic} disabled={ended} aria-pressed={listening}>
                {listening ? <MicOff size={20} /> : started ? <Mic size={20} /> : <Play size={18} fill="currentColor" />}
                <span>{ended ? 'Interview complete' : listening ? 'Listening · tap to finish answer' : speaking ? 'Interviewer is speaking…' : started ? 'Tap to answer by voice' : 'Start voice interview'}</span>
              </button>
              <span className="voice-control-hint">{listening ? 'Your answer is sent automatically after you finish speaking.' : 'No typing. Just speak naturally.'}</span>
              {notice && <p className="notice" role="status">{notice}</p>}
            </div>
            <div className="stage-footer"><span><span className="secure-dot" /> Your answers stay private</span><span>Built for practice, not performance.</span></div>
          </div>
        </section>

        <aside className={`transcript-panel ${captionsVisible ? 'is-open' : ''}`} aria-label="Conversation transcript and participants">
          <div className="transcript-header"><div><span className="transcript-kicker">PEOPLE IN THIS SESSION</span><h2>Interview room</h2></div><button className="icon-button" aria-label="More conversation options"><MoreHorizontal size={18} /></button></div>
          <div className="participant-list">
            <div className="participant-card"><div className="profile-avatar ai-profile"><AudioLines size={16} /></div><div className="participant-meta"><strong>Alex Morgan</strong><span>AI interviewer</span></div><span className="participant-status"><i /> AI</span></div>
            <div className="participant-card"><div className="profile-avatar user-profile">Y</div><div className="participant-meta"><strong>Your profile</strong><span>Candidate</span></div><span className="participant-status candidate-status"><i /> YOU</span></div>
          </div>
          <div className="session-progress"><div className="progress-copy"><span>SESSION TIMELINE</span><span>{String(questionIndex + 1).padStart(2, '0')} <i>/</i> {String(questions.length).padStart(2, '0')}</span></div><div className="progress-track"><span style={{ width: `${((questionIndex + (ended ? 1 : 0)) / questions.length) * 100}%` }} /></div></div>
          <div className="transcript-list" aria-live="polite">{turns.map((turn, index) => <article className={`transcript-turn ${turn.role}`} key={`${turn.time}-${index}`}><div className={`turn-avatar ${turn.role === 'you' ? 'user-turn-avatar' : ''}`}>{turn.role === 'interviewer' ? <AudioLines size={14} /> : 'Y'}</div><div className="turn-content"><div className="turn-heading"><strong>{turn.role === 'interviewer' ? 'Alex · AI' : 'You · Candidate'}</strong><time>{turn.time}</time></div><p>{turn.text}</p></div></article>)}</div>
          <div className="transcript-footer"><div className="timer-icon"><Clock3 size={15} /></div><div className="timer-copy"><span>SESSION TIME</span><strong>{elapsedLabel}</strong></div><div className="audio-control"><button className="icon-button" onClick={() => setMuted(!muted)} aria-label={muted ? 'Unmute audio' : 'Mute audio'}>{muted ? <VolumeX size={17} /> : <Volume2 size={17} />}</button><span>{muted ? 'Muted' : 'Audio on'}</span></div></div>
          <button className="help-link" onClick={togglePause} disabled={!started || ended} aria-pressed={paused}><Waves size={15} /> Need a moment? <span>{paused ? 'Resume session' : 'Pause session'}</span>{paused ? <Play size={13} /> : <Pause size={13} />}</button>
        </aside>
      </div>
      <div className="desktop-self-view" aria-label="Candidate profile, voice only"><span className="self-view-status"><i /> VOICE ONLY</span><div className="self-view-avatar">Y</div><strong>Your profile</strong><span>Candidate</span></div>
    </main>
  )
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition
    webkitSpeechRecognition?: new () => SpeechRecognition
  }
  interface SpeechRecognition extends EventTarget {
    lang: string
    interimResults: boolean
    continuous: boolean
    onresult: ((event: SpeechRecognitionEvent) => void) | null
    onerror: (() => void) | null
    onend: (() => void) | null
    start(): void
    stop(): void
  }
  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList
  }
}
