"use client";
import styles from './HomeScreen.module.css';
import Fireflies from './Fireflies';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useRef } from 'react';

export default function Home() {
  const router = useRouter();
  const [showBook, setShowBook] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const audioRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [introStep, setIntroStep] = useState(1); // 1, 2, 3
  const introParts = [
    [
      'Welkom in het StemLabyrint,',
      '',
      'een plek waar jouw stem de weg wijst. Hier leeft een zachte, gloeiende bol een magisch lichtje dat verdwaald is in een oud kasteel vol geheime kamers en rustgevende verrassingen.',
      '',
      'Het lichtje hoort bij de Bewakers van Balans: wezens die kinderen helpen om rustig te worden, beter te praten en zich sterk te voelen. Maar de bol is zijn kracht kwijtgeraakt...'
    ],
    [
      'Alleen jij kunt helpen,',
      '',
      'Door te spreken, wijs jij het lichtje de weg. Gebruik woorden als "vooruit", "links" of "rechts". Maar let op: op sommige plekken moet je iets leren of even ontspannen. Je stem is de sleutel: zacht is goed, duidelijk is krachtig.'
    ],
    [
      'Jouw missie?,',
      '',
      'Help het lichtje zijn kracht terug te vinden. Onderweg leer je woorden, oefen je rustig ademen en ontdek je geheime spelletjes. Er is geen haast. Geen fouten. Alleen jouw stem, jouw tempo en een magische reis vol ontdekkingen.',
      '',
      'Ben je er klaar voor?'
    ]
  ];
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.18;
    }
  }, [audioRef, muted]);

  // Start audio na eerste interactie als autoplay niet werkt
  useEffect(() => {
    if (audioStarted || !audioRef.current) return;
    const startAudio = () => {
      if (audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
      }
      setAudioStarted(true);
      window.removeEventListener('click', startAudio);
    };
    window.addEventListener('click', startAudio);
    return () => window.removeEventListener('click', startAudio);
  }, [audioStarted]);

  // Start line-by-line intro when overlay opens or step changes
  useEffect(() => {
    if (!showIntro) return;
    setVisibleLines(0);
    let cancelled = false;
    const lines = introParts[introStep - 1];
    const delaysPerLine = lines.map(line => (line.trim().length === 0 ? 300 : Math.min(2600, 900 + line.length * 18)));
    let totalDelay = 0;
    lines.forEach((_, index) => {
      totalDelay += index === 0 ? 0 : delaysPerLine[index - 1];
      setTimeout(() => {
        if (cancelled) return;
        setVisibleLines(v => Math.max(v, index + 1));
      }, totalDelay + 200);
    });
    return () => { cancelled = true; };
  }, [showIntro, introStep]);

  const handleStart = () => {
    if (navigating) return;
    setIntroStep(1);
    setShowIntro(true);
  };

  const handleSkipIntro = () => {
    if (navigating) return;
    setNavigating(true);
    router.push('/tutorial');
  };

  const handleNext = () => {
    if (introStep < 3) {
      setIntroStep(s => s + 1);
    } else {
      handleSkipIntro();
    }
  };
  return (
    <main className={styles.container}>
      <audio
        ref={audioRef}
        src="/medieval.mp3"
        autoPlay
        loop
        muted={muted}
        style={{ display: 'none' }}
      />
      <button
        onClick={() => {
          setMuted(m => !m);
          if (audioRef.current) audioRef.current.muted = !muted;
        }}
        style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 20,
          background: '#23243a',
          color: '#ffe066',
          border: '2px solid #d4af37',
          borderRadius: '50%',
          width: 48,
          height: 48,
          fontSize: 24,
          cursor: 'pointer',
          boxShadow: '0 2px 8px #000a',
        }}
        aria-label={muted ? 'Zet muziek aan' : 'Zet muziek uit'}
      >
        {muted ? '🔇' : '🎵'}
      </button>
      <div className={styles.mist}>
        <div className={styles.mistLayer}></div>
        <div className={styles.mistLayer2}></div>
        <div className={styles.mistLayer3}></div>
      </div>
      <Fireflies />
      {!showIntro && (
        <>
          <h1 className={styles.title}>StemLabyrint</h1>
          <span style={{position: 'absolute', left: '-9999px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden'}}>StemLabyrint magical voice maze homescreen</span>
          <p className={styles.subtitle}>Beweeg de gloeiende bol met je stem. Ontdek, leer en speel in een magische wereld.</p>
          <button className={styles.startButton} aria-label="Enter the magical forest" onClick={handleStart}>Enter</button>
        </>
      )}

      {showIntro && (
        <div className={styles.introOverlay} role="dialog" aria-modal="true">
          <div className={styles.introContent}>
            <div className={styles.introHeader}>Deel {introStep} van 3</div>
            <div className={styles.introText}>
              {introParts[introStep - 1].slice(0, visibleLines).map((line, idx) => (
                <p key={idx} className={`${styles.introLine} ${idx === 0 ? styles.introLead : ''}`}>
                  {line}
                </p>
              ))}
            </div>
            <div className={styles.introActions}>
              <button
                className={styles.secondaryButton}
                onClick={handleSkipIntro}
                aria-label="Sla introductie over"
              >
                Overslaan
              </button>
              <button
                className={styles.primaryButton}
                onClick={handleNext}
                aria-label={introStep < 3 ? 'Verder' : 'Start'}
              >
                {introStep < 3 ? 'Verder' : 'Start'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
