"use client";
import React, { useRef, useState } from 'react';
import styles from '../HomeScreen.module.css';
import Fireflies from '../Fireflies';
import { FaCheckCircle } from 'react-icons/fa';

export default function Tutorial() {
  const [listening, setListening] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [orbPos, setOrbPos] = useState({ x: 0, y: 0 });
  const [step, setStep] = useState('vooruit'); // 'vooruit' or 'directions'
  const [completed, setCompleted] = useState({ links: false, rechts: false, achteruit: false });
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
      let handled = false;
      if (step === 'vooruit') {
        if (transcript.includes('vooruit')) {
          setFeedback('');
          setOrbPos(pos => ({ x: pos.x, y: pos.y - 80 }));
          handled = true;
          setTimeout(() => {
            setOrbPos(pos => ({ x: 0, y: 0 }));
            setFeedback('Goed zo! Je hebt de bol vooruit bewogen.');
            setTimeout(() => {
              setStep('directions');
              setFeedback('');
            }, 1200);
          }, 1200);
        }
      } else if (step === 'directions') {
        if (!completed.links && transcript.includes('links')) {
          setFeedback('');
          setOrbPos(pos => ({ x: pos.x - 80, y: pos.y }));
          handled = true;
          setTimeout(() => {
            setOrbPos(pos => ({ x: 0, y: 0 }));
            setFeedback('Goed zo! Je hebt de bol naar links bewogen.');
            setCompleted(prev => ({ ...prev, links: true }));
            setTimeout(() => setFeedback(''), 1200);
          }, 1200);
        } else if (!completed.rechts && transcript.includes('rechts')) {
          setFeedback('');
          setOrbPos(pos => ({ x: pos.x + 80, y: pos.y }));
          handled = true;
          setTimeout(() => {
            setOrbPos(pos => ({ x: 0, y: 0 }));
            setFeedback('Goed zo! Je hebt de bol naar rechts bewogen.');
            setCompleted(prev => ({ ...prev, rechts: true }));
            setTimeout(() => setFeedback(''), 1200);
          }, 1200);
        } else if (!completed.achteruit && transcript.includes('achteruit')) {
          setFeedback('');
          setOrbPos(pos => ({ x: pos.x, y: pos.y + 80 }));
          handled = true;
          setTimeout(() => {
            setOrbPos(pos => ({ x: 0, y: 0 }));
            setFeedback('Goed zo! Je hebt de bol achteruit bewogen.');
            setCompleted(prev => ({ ...prev, achteruit: true }));
            setTimeout(() => setFeedback(''), 1200);
          }, 1200);
        }
      }
      if (!handled) {
        if (step === 'vooruit') {
          setFeedback(`Je zei: "${transcript}". Probeer "vooruit" te zeggen.`);
        } else {
          setFeedback(`Je zei: "${transcript}". Probeer "links", "rechts" of "achteruit" te zeggen.`);
        }
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

  const allDone = completed.links && completed.rechts && completed.achteruit;

  return (
    <main className={styles.container}>
      <div className={styles.mist}>
        <div className={styles.mistLayer}></div>
        <div className={styles.mistLayer2}></div>
        <div className={styles.mistLayer3}></div>
      </div>
      <Fireflies />
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', width: '100%',
      }}>
        <h1 className={styles.title}>Instructie</h1>
        <p className={styles.subtitle} style={{ maxWidth: 600, minHeight: 80, textAlign: 'center' }}>
          {step === 'vooruit'
            ? 'Zeg “vooruit” om de bol te laten bewegen.'
            : allDone
              ? 'Goed gedaan! Je hebt alle richtingen geprobeerd.'
              : 'Zeg “links”, “rechts” of “achteruit” om de bol te bewegen.'}
        </p>
        {/* Orb and directions/checkmarks row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2.5em',
          margin: '2em 0 1em 0',
          position: 'relative',
          zIndex: 5,
        }}>
          {/* Links (left) */}
          {step === 'directions' ? (
            <span style={{
              minWidth: 90,
              display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '2.1rem', color: completed.links ? '#aef6c7' : '#fff', fontWeight: 700, textShadow: '0 2px 8px #000',
            }}>
              Links
              {completed.links && <FaCheckCircle style={{ color: '#aef6c7', marginTop: 6, fontSize: '1.5em' }} />}
            </span>
          ) : <span style={{ minWidth: 90 }} />}
          {/* Orb */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              className={styles.startButton}
              style={{
                margin: 0,
                position: 'static',
                transform: `translate(${orbPos.x}px, ${orbPos.y}px)` ,
                transition: 'transform 1.2s cubic-bezier(.6,0,.4,1)',
              }}
              aria-label="Glowing orb"
            />
            {/* Achteruit (back) below orb */}
            {step === 'directions' && (
              <span style={{
                marginTop: '1.1em',
                fontSize: '2.1rem',
                color: completed.achteruit ? '#aef6c7' : '#fff',
                fontWeight: 700,
                textShadow: '0 2px 8px #000',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
              }}>
                Achteruit
                {completed.achteruit && <FaCheckCircle style={{ color: '#aef6c7', marginTop: 6, fontSize: '1.5em' }} />}
              </span>
            )}
          </div>
          {/* Rechts (right) */}
          {step === 'directions' ? (
            <span style={{
              minWidth: 90,
              display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '2.1rem', color: completed.rechts ? '#aef6c7' : '#fff', fontWeight: 700, textShadow: '0 2px 8px #000',
            }}>
              Rechts
              {completed.rechts && <FaCheckCircle style={{ color: '#aef6c7', marginTop: 6, fontSize: '1.5em' }} />}
            </span>
          ) : <span style={{ minWidth: 90 }} />}
        </div>
        <button
          onClick={startListening}
          style={{
            fontFamily: 'UnifrakturCook, serif',
            fontSize: '1.6rem',
            padding: '0.7em 2.5em',
            margin: '2em 0 1em 0',
            borderRadius: '1.2em',
            border: '3px solid #d4af37',
            background: listening ? '#444' : 'linear-gradient(180deg, #2d2323 0%, #5a4a1c 100%)',
            color: '#ffe066',
            boxShadow: '0 4px 16px #000a, 0 2px 0 #d4af37',
            cursor: listening ? 'not-allowed' : 'pointer',
            textShadow: '0 2px 8px #000, 0 1px 0 #d4af37',
            borderBottom: '6px solid #a67c1a',
            letterSpacing: '0.04em',
            fontWeight: 700,
            transition: 'background 0.2s, box-shadow 0.2s',
            zIndex: 10,
          }}
          aria-label="Spreek"
        >
          {listening ? 'Luisteren...' : 'Spreek'}
        </button>
        <div style={{ minHeight: 48, margin: '1em 0', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {feedback && (
            <div style={{
              color: '#aef6c7',
              fontSize: '2rem',
              textAlign: 'center',
              textShadow: '0 2px 12px #000',
              fontWeight: 700,
            }}>{feedback}</div>
          )}
        </div>
        {step === 'directions' && (
          <div style={{ marginTop: '2em', color: '#fff8', fontSize: '1.2rem', textAlign: 'center' }}>
            Mogelijke commando’s:
            <div style={{ display: 'flex', gap: '2em', justifyContent: 'center', marginTop: '0.7em' }}>
              <span style={{ color: completed.links ? '#aef6c7' : '#fff' }}>
                Links {completed.links && <FaCheckCircle style={{ color: '#aef6c7', marginLeft: 4, verticalAlign: 'middle' }} />}
              </span>
              <span style={{ color: completed.rechts ? '#aef6c7' : '#fff' }}>
                Rechts {completed.rechts && <FaCheckCircle style={{ color: '#aef6c7', marginLeft: 4, verticalAlign: 'middle' }} />}
              </span>
              <span style={{ color: completed.achteruit ? '#aef6c7' : '#fff' }}>
                Achteruit {completed.achteruit && <FaCheckCircle style={{ color: '#aef6c7', marginLeft: 4, verticalAlign: 'middle' }} />}
              </span>
            </div>
            {allDone && <div style={{ color: '#ffe066', marginTop: '1.5em', fontWeight: 700, fontSize: '1.3em' }}>Je hebt het gehaald!</div>}
            {!allDone && <span style={{ color: '#b0e0ff', display: 'block', marginTop: '1em' }}>Zeg een richting…</span>}
          </div>
        )}
      </div>
    </main>
  );
} 