"use client";
import React, { useRef, useState } from 'react';
import styles from '../HomeScreen.module.css';
import Fireflies from '../Fireflies';

export default function TestVoice() {
  const [listening, setListening] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [orbPos, setOrbPos] = useState({ x: 0, y: 0 });
  const recognitionRef = useRef(null);

  function startListening() {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setFeedback('Web Speech API wordt niet ondersteund in deze browser.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'nl-NL';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim().toLowerCase();
      if (transcript.includes('vooruit')) {
        setOrbPos(pos => ({ x: pos.x, y: pos.y - 80 }));
        setFeedback('Goed zo! Je zei "vooruit".');
      } else {
        setFeedback(`Je zei: "${transcript}". Probeer "vooruit" te zeggen.`);
      }
      setListening(false);
    };
    recognition.onerror = (event) => {
      setFeedback('Er is een fout opgetreden bij spraakherkenning.');
      setListening(false);
    };
    recognition.onend = () => {
      setListening(false);
    };
    recognitionRef.current = recognition;
    setFeedback('Luisteren...');
    setListening(true);
    recognition.start();
  }

  return (
    <main className={styles.container}>
      <div className={styles.mist}>
        <div className={styles.mistLayer}></div>
        <div className={styles.mistLayer2}></div>
        <div className={styles.mistLayer3}></div>
      </div>
      <Fireflies />
      <h1 className={styles.title}>Spraaktest</h1>
      <p className={styles.subtitle} style={{ maxWidth: 600 }}>
        Zeg <b>"vooruit"</b> om de bol te laten bewegen.<br />
        <button
          onClick={startListening}
          disabled={listening}
          style={{
            fontSize: '1.3rem',
            marginTop: '1em',
            padding: '0.5em 2em',
            borderRadius: '1em',
            border: 'none',
            background: listening ? '#888' : '#23243a',
            color: '#fff',
            boxShadow: '0 2px 12px #0006',
            cursor: listening ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
          }}
          aria-label="Start luisteren"
        >
          {listening ? 'Luisteren...' : 'Start luisteren'}
        </button>
      </p>
      <div
        className={styles.startButton}
        style={{
          position: 'relative',
          left: orbPos.x,
          top: orbPos.y,
          margin: '2em auto',
          transition: 'left 1.2s cubic-bezier(.6,0,.4,1), top 1.2s cubic-bezier(.6,0,.4,1)',
        }}
        aria-label="Glowing orb"
      />
      {feedback && (
        <div style={{
          color: '#aef6c7',
          fontSize: '2rem',
          marginTop: '1em',
          textAlign: 'center',
          textShadow: '0 2px 12px #000',
          fontWeight: 700,
        }}>{feedback}</div>
      )}
    </main>
  );
} 