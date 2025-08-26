'use client';
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from '../HomeScreen.module.css';
import Fireflies from '../Fireflies';
import mazeStyles from './page.module.css';

// New, longer, and more logical maze: 1 = wall, 0 = path
const MAZE = [
  [1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,1,0,0,0,0,1],
  [1,0,1,0,1,0,1,1,0,1],
  [1,0,1,0,0,0,0,1,0,1],
  [1,0,1,1,1,1,0,1,0,1],
  [1,0,0,0,0,1,0,1,0,1],
  [1,1,1,1,0,1,0,1,0,1],
  [1,0,0,1,0,0,0,1,0,1],
  [1,0,1,1,1,1,1,1,0,1],
  [1,0,1,0,0,0,0,0,0,1],
  [1,0,1,0,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1],
];

const TILE_SIZE = 60; // Size of each cell
const WALL_THICKNESS = 10;
const MAZE_BG = '#23243a'; // Castle night blue-gray
const WALL_COLOR = '#7a7a7a'; // Stone gray
const WALL_SHADOW = '#444';

function findCenterCorridorCell(maze) {
  const rows = maze.length;
  const cols = maze[0].length;
  const centerY = Math.floor(rows / 2);
  const centerX = Math.floor(cols / 2);
  let minDist = Infinity;
  let best = { x: centerX, y: centerY };
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (maze[y][x] === 0) {
        const dist = Math.abs(centerX - x) + Math.abs(centerY - y);
        if (dist < minDist) {
          minDist = dist;
          best = { x, y };
        }
      }
    }
  }
  return best;
}

// Pick 3 well-separated corridor cells for mini-game points
const MINI_GAME_POINTS = [
  { x: 1, y: 1 }, // Top-left open
  { x: 8, y: 5 }, // Middle-right
  { x: 4, y: 11 }, // Bottom-middle
];

function EchoChamberMiniGame({ onClose, onComplete }) {
  const WORDS = ['glinsteren', 'ademen', 'magisch'];
  const [sequence, setSequence] = useState(() => {
    const shuffled = [...WORDS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  });
  const [stepIndex, setStepIndex] = useState(0); // 0..2
  const [heardWord, setHeardWord] = useState('');
  const [listening, setListening] = useState(false);
  const [introStep, setIntroStep] = useState(1); // 1, 2, 3
  const [showIntro, setShowIntro] = useState(true);
  const recognitionRef = useRef(null);
  const glinsterenAudioRef = useRef(null);
  const ademenAudioRef = useRef(null);
  const magischAudioRef = useRef(null);

  const targetWord = sequence[stepIndex];

  function normalize(text) {
    return text
      .toLowerCase()
      .replace(/[^a-zà-ž\s]/gi, '')
      .trim();
  }

  function speakWhisper(word) {
    // Play dedicated audio for the three supported words
    const w = normalize(word);
    try {
      const stopIfPlaying = (ref) => { if (ref.current) { ref.current.pause(); ref.current.currentTime = 0; } };
      stopIfPlaying(glinsterenAudioRef);
      stopIfPlaying(ademenAudioRef);
      stopIfPlaying(magischAudioRef);
      let audio;
      if (w === 'glinsteren') {
        audio = glinsterenAudioRef.current || new Audio('/glinsteren.mp3');
        glinsterenAudioRef.current = audio;
      } else if (w === 'ademen') {
        audio = ademenAudioRef.current || new Audio('/ademen.mp3');
        ademenAudioRef.current = audio;
      } else if (w === 'magisch') {
        audio = magischAudioRef.current || new Audio('/magisch.mp3');
        magischAudioRef.current = audio;
      }
      if (audio) {
        audio.volume = 0.8;
        audio.playbackRate = 1.0;
        void audio.play();
      }
    } catch (e) {
      // ignore play failures (autoplay restrictions)
    }
  }

  // Start spraakherkenning eenmaal actief
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'nl-NL';
    try {
      recognition.start();
      setListening(true);
    } catch (e) {}
    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      setHeardWord(transcript);
      const normalized = normalize(transcript);
      const words = normalized.split(/\s+/);
      const matched = words.includes(normalize(targetWord));
      if (matched) {
        const nextIndex = stepIndex + 1;
        if (nextIndex >= 3) {
          try { recognition.stop(); } catch {}
          setTimeout(() => {
            onComplete?.(true);
          }, 600);
        } else {
          setStepIndex(nextIndex);
          setTimeout(() => speakWhisper(sequence[nextIndex]), 250);
        }
      }
    };
    recognition.onerror = () => setListening(false);
    return () => { try { recognition.stop(); } catch {} };
  }, [stepIndex, targetWord, sequence, onComplete]);

  // Speel fluisterwoord wanneer gestart of wanneer intro sluit
  useEffect(() => {
    if (!showIntro) {
      speakWhisper(targetWord);
    }
  }, [showIntro]);

  const progress = (stepIndex / 3) * 100;

  const handleNextIntro = () => {
    if (introStep < 3) {
      setIntroStep(s => s + 1);
    } else {
      setShowIntro(false);
    }
  };

  return (
    <div className={mazeStyles.echoOverlay}>
      <div className={mazeStyles.echoCard}>
        {showIntro && (
          <div className={mazeStyles.echoIntro}>
            <div className={mazeStyles.echoTitle}>De Kamer van de Echo’s</div>
            <div className={mazeStyles.echoSubtitle}>Luister naar 3 fluister-woorden en zeg ze duidelijk na.</div>
            <div className={mazeStyles.echoHint}>Als je het woord juist zegt, groeit je lichtje en ga je naar het volgende.</div>
            <button className={mazeStyles.echoStartBtn} onClick={() => setShowIntro(false)}>Start</button>
          </div>
        )}
        <div className={mazeStyles.echoWordStep}>Woord {stepIndex + 1} van 3</div>
        <div className={mazeStyles.echoWord}>“{targetWord}”</div>
        <div className={mazeStyles.echoProgressBar}>
          <div className={mazeStyles.echoProgressFill} style={{ width: `${progress}%` }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
          <div className={mazeStyles.echoOrb} style={{
            width: 84 + 18 * stepIndex,
            height: 84 + 18 * stepIndex,
            boxShadow: `0 0 ${20 + 14 * stepIndex}px ${6 + 4 * stepIndex}px rgba(62,207,255,0.45)`
          }} />
        </div>
        <div className={`${mazeStyles.echoMicState} ${listening ? '' : 'off'}`}>
          {listening ? 'Luistert… 🎤' : 'Microfoon niet actief'}
        </div>
        <div className={mazeStyles.echoHeard}>
          {heardWord ? `Jij zei: “${heardWord}”` : 'Zeg het woord na…'}
        </div>
        <div className={mazeStyles.echoButtons}>
          <button className={mazeStyles.echoBtn} onClick={() => speakWhisper(targetWord)}>Herhaal fluister</button>
          <button className={mazeStyles.echoBtn} onClick={onClose}>Sluit</button>
        </div>
      </div>
    </div>
  );
}

function RhymeTowerMiniGame({ onClose, onComplete }) {
  const RHYME_SETS = [
    { base: 'kat', tail: 'at', rhymes: ['rat', 'mat', 'bat', 'plat'] },
    { base: 'boon', tail: 'oon', rhymes: ['zoon', 'loon', 'toon'] },
    { base: 'trein', tail: 'ein', rhymes: ['plein', 'schijn', 'rein'] },
    { base: 'steen', tail: 'een', rhymes: ['been', 'leen', 'heen'] },
  ];
  const [stepIndex, setStepIndex] = useState(0); // 0..N-1 words to rhyme
  const [stairs, setStairs] = useState(0); // 0..5
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState('');
  const [current, setCurrent] = useState(() => RHYME_SETS[Math.floor(Math.random() * RHYME_SETS.length)]);
  const recognitionRef = useRef(null);
  const switchingRef = useRef(false);
  const [hint, setHint] = useState('Zeg een woord dat rijmt op het woord.');
  const [showIntro, setShowIntro] = useState(true);

  function pickNextWord() {
    setCurrent(RHYME_SETS[Math.floor(Math.random() * RHYME_SETS.length)]);
  }

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'nl-NL';
    try { recognition.start(); setListening(true); } catch (e) {}
    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      // Take only the last word spoken
      const normalized = transcript
        .replace(/[^a-zà-ž\s-]/gi, ' ')
        .split(/\s+/)
        .filter(Boolean);
      const lastWord = normalized[normalized.length - 1] || '';
      setHeard(lastWord || transcript.trim());
      if (!lastWord) return;
      if (lastWord === current.base) return; // base word itself doesn't count
      const exact = current.rhymes.includes(lastWord);
      const tailOk = lastWord.length > (current.tail?.length || 0) && (current.tail ? lastWord.endsWith(current.tail) : false);
      if (exact || tailOk) {
        if (switchingRef.current) return;
        switchingRef.current = true;
        setHint('Goed gerijmd!');
        setStairs(prev => {
          const next = Math.min(5, prev + 1);
          if (next >= 5) {
            setTimeout(() => onComplete?.(true), 600);
          } else {
            setTimeout(() => {
              pickNextWord();
              setHeard('');
              setHint('Zeg een woord dat rijmt op het woord.');
              switchingRef.current = false;
            }, 450);
          }
          return next;
        });
      }
    };
    return () => { try { recognition.stop(); } catch {} };
  }, [current, onComplete]);

  return (
    <div className={mazeStyles.echoOverlay}>
      <div className={mazeStyles.echoCard}>
        <div className={mazeStyles.echoTitle}>De Rijmkasteel Toren</div>
        <div className={mazeStyles.echoSubtitle}>Zeg een rijmwoord op:</div>
        <div className={mazeStyles.echoWord}>“{current.base}”</div>
        <div className={mazeStyles.echoProgressBar}>
          <div className={mazeStyles.echoProgressFill} style={{ width: `${(stairs/5)*100}%` }} />
        </div>
        <div className={mazeStyles.echoHint}>Trap treden: {stairs} / 5 — {hint}</div>
        <div className={mazeStyles.echoHeard}>{heard ? `Jij zei: “${heard}”` : 'Zeg een woord dat rijmt...'}</div>
        <div className={mazeStyles.echoButtons}>
          <button className={mazeStyles.echoBtn} onClick={() => pickNextWord()}>Ander woord</button>
          <button className={mazeStyles.echoBtn} onClick={onClose}>Sluit</button>
        </div>
      </div>
    </div>
  );
}

function MemoryPalaceMiniGame({ onClose, onComplete }) {
  const OBJECTS = [
    { name: 'sleutel', src: '/sleutel.png' },
    { name: 'kist', src: '/Kist.png' },
    { name: 'lamp', src: '/lamp.png' },
  ];
  const [sequence, setSequence] = useState(() => [...OBJECTS].sort(() => Math.random() - 0.5));
  const [phase, setPhase] = useState('show'); // show | recall | success
  const [visible, setVisible] = useState([]); // items currently shown
  const [heard, setHeard] = useState('');
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const [recalled, setRecalled] = useState([]);
  const [imgFallback, setImgFallback] = useState({}); // { [name]: 'capital' | 'text' }

  useEffect(() => {
    // Show objects one by one
    if (phase !== 'show') return;
    // Show all three at once for clarity
    setVisible(sequence);
    const timeout = setTimeout(() => {
      setVisible([]);
      setPhase('recall');
    }, 2000);
    return () => clearTimeout(timeout);
  }, [phase, sequence]);

  useEffect(() => {
    if (phase !== 'recall') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'nl-NL';
    try { recognition.start(); setListening(true); } catch (e) {}
    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      setHeard(transcript);
      const words = transcript
        .replace(/[^a-zà-ž\s-]/gi, ' ')
        .split(/\s+/)
        .filter(Boolean);
      // Capture recognized items from allowed set (names only)
      const found = OBJECTS.filter(obj => words.includes(obj.name)).map(obj => obj.name);
      // Deduplicate while keeping order of appearance
      const orderedUnique = [];
      for (const w of found) if (!orderedUnique.includes(w)) orderedUnique.push(w);
      setRecalled(orderedUnique);
      if (orderedUnique.length === OBJECTS.length) {
        setPhase('success');
        setTimeout(() => onComplete?.(true), 700);
      }
    };
    return () => { try { recognition.stop(); } catch {} };
  }, [phase, sequence, onComplete]);

  return (
    <div className={mazeStyles.echoOverlay}>
      <div className={mazeStyles.echoCard}>
        <div className={mazeStyles.echoTitle}>Het Geheugenpaleis</div>
        <div className={mazeStyles.echoSubtitle}>
          Onthoud de objecten en noem ze daarna op in één zin.
        </div>
        <div style={{ display: 'flex', gap: 18, justifyContent: 'center', alignItems: 'center', minHeight: 92, margin: '10px 0 16px' }}>
          {visible.filter(Boolean).map((obj, i) => {
            const isObj = typeof obj === 'object' && obj !== null;
            const name = isObj ? obj.name : String(obj);
            let src = isObj ? obj.src : undefined;
            const fallbackState = imgFallback[name];
            if (fallbackState === 'capital' && src) {
              const parts = src.split('/');
              const file = parts.pop() || '';
              const capital = file.charAt(0).toUpperCase() + file.slice(1);
              src = [...parts, capital].join('/') || `/${capital}`;
            } else if (fallbackState === 'text') {
              src = undefined;
            }
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {src ? (
                  <Image
                    src={src}
                    alt={name}
                    width={72}
                    height={72}
                    style={{ objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.35))' }}
                    priority
                    onError={() => {
                      setImgFallback(prev => {
                        const current = prev[name];
                        if (!current) return { ...prev, [name]: 'capital' };
                        if (current === 'capital') return { ...prev, [name]: 'text' };
                        return prev;
                      });
                    }}
                  />
                ) : (
                  <div className={mazeStyles.echoBtn} style={{ padding: '0.4em 0.8em' }}>{name}</div>
                )}
                <div className={mazeStyles.echoHint} style={{ marginTop: 6 }}>{name}</div>
              </div>
            );
          })}
          {phase === 'recall' && visible.length === 0 && (
            <div className={mazeStyles.echoHint}>Zeg bijvoorbeeld: “Ik zag een kat, boom en vaas.”</div>
          )}
        </div>
        <div className={mazeStyles.echoProgressBar}>
          <div className={mazeStyles.echoProgressFill} style={{ width: `${(recalled.length/OBJECTS.length)*100}%` }} />
        </div>
        <div className={mazeStyles.echoHeard}>{heard ? `Jij zei: “${heard}”` : (phase === 'show' ? 'Kijk goed…' : 'Noem ze op…')}</div>
        <div className={`${mazeStyles.echoMicState} ${listening ? '' : 'off'}`}>{listening ? 'Luistert… 🎤' : 'Microfoon niet actief'}</div>
        <div className={mazeStyles.echoButtons}>
          <button className={mazeStyles.echoBtn} onClick={() => { setPhase('show'); setHeard(''); setRecalled([]); }}>Nog eens tonen</button>
          <button className={mazeStyles.echoBtn} onClick={onClose}>Sluit</button>
        </div>
      </div>
    </div>
  );
}

export default function MazeTestPage() {
  const canvasRef = useRef(null);
  // Find the center-most corridor cell for orb start
  const { x: centerX, y: centerY } = findCenterCorridorCell(MAZE);
  // Orb position in grid
  const [orbPos, setOrbPos] = useState({ x: centerX, y: centerY });
  // Orb position in pixels for animation
  const [orbPixel, setOrbPixel] = useState({ x: 0, y: 0 });
  // Store maze offsets for pixel calculation
  const mazeOffsets = useRef({ offsetX: 0, offsetY: 0 });
  const [showInstruction, setShowInstruction] = useState(true);
  const [activeMiniGame, setActiveMiniGame] = useState(null); // null of index van MINI_GAME_POINTS
  const [completedPoints, setCompletedPoints] = useState(MINI_GAME_POINTS.map(() => false));
  const completedPointsRef = useRef(completedPoints);
  const [showWinScreen, setShowWinScreen] = useState(false);
  useEffect(() => { completedPointsRef.current = completedPoints; }, [completedPoints]);
  
  // Check if all mini-games are completed
  useEffect(() => {
    if (completedPoints.every(point => point === true) && !showWinScreen) {
      setShowWinScreen(true);
    }
  }, [completedPoints, showWinScreen]);
  // Voice movement control session toggles
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceSession, setVoiceSession] = useState(0);

  // Draw maze (static, only once)
  function drawMazeStatic() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const mazeRows = MAZE.length;
    const mazeCols = MAZE[0].length;
    const mazeWidth = mazeCols * TILE_SIZE;
    const mazeHeight = mazeRows * TILE_SIZE;
    const offsetX = (canvas.width - mazeWidth) / 2;
    const offsetY = (canvas.height - mazeHeight) / 2;
    mazeOffsets.current = { offsetX, offsetY };
    // Draw maze background
    ctx.fillStyle = MAZE_BG;
    ctx.fillRect(offsetX, offsetY, mazeWidth, mazeHeight);
    // Draw vertical walls
    for (let x = 0; x <= mazeCols; x++) {
      for (let y = 0; y < mazeRows; y++) {
        if (x === 0 || x === mazeCols || MAZE[y][x - 1] === 1 || (x < mazeCols && MAZE[y][x] === 1)) {
          ctx.fillStyle = WALL_COLOR;
          ctx.fillRect(
            offsetX + x * TILE_SIZE - WALL_THICKNESS / 2,
            offsetY + y * TILE_SIZE,
            WALL_THICKNESS,
            TILE_SIZE
          );
          ctx.fillStyle = WALL_SHADOW;
          ctx.fillRect(
            offsetX + x * TILE_SIZE + WALL_THICKNESS / 2 - 2,
            offsetY + y * TILE_SIZE,
            2,
            TILE_SIZE
          );
        }
      }
    }
    // Draw horizontal walls
    for (let y = 0; y <= mazeRows; y++) {
      for (let x = 0; x < mazeCols; x++) {
        if (y === 0 || y === mazeRows || MAZE[y - 1]?.[x] === 1 || (y < mazeRows && MAZE[y][x] === 1)) {
          ctx.fillStyle = WALL_COLOR;
          ctx.fillRect(
            offsetX + x * TILE_SIZE,
            offsetY + y * TILE_SIZE - WALL_THICKNESS / 2,
            TILE_SIZE,
            WALL_THICKNESS
          );
          ctx.fillStyle = WALL_SHADOW;
          ctx.fillRect(
            offsetX + x * TILE_SIZE,
            offsetY + y * TILE_SIZE + WALL_THICKNESS / 2 - 2,
            TILE_SIZE,
            2
          );
        }
      }
    }
    // Draw mini-game points
    MINI_GAME_POINTS.forEach(({ x, y }, idx) => {
      const mgX = offsetX + (x + 0.5) * TILE_SIZE;
      const mgY = offsetY + (y + 0.5) * TILE_SIZE;
      const mgRadius = TILE_SIZE * 0.22;
      const isDone = completedPointsRef.current[idx];
      const innerColor = isDone ? '#7fdc9f' : '#ffe066';
      const midColor = isDone ? '#4ec97a' : '#ffd700';
      const outerColor = isDone ? 'rgba(79, 201, 122, 0.12)' : 'rgba(255, 224, 102, 0.08)';
      const mgGradient = ctx.createRadialGradient(mgX, mgY, mgRadius * 0.2, mgX, mgY, mgRadius);
      mgGradient.addColorStop(0, innerColor);
      mgGradient.addColorStop(0.5, midColor);
      mgGradient.addColorStop(1, outerColor);
      ctx.save();
      ctx.globalAlpha = isDone ? 0.85 : 0.92;
      ctx.beginPath();
      ctx.arc(mgX, mgY, mgRadius, 0, 2 * Math.PI);
      ctx.fillStyle = mgGradient;
      ctx.shadowColor = isDone ? '#4ec97a' : '#ffd700';
      ctx.shadowBlur = isDone ? 10 : 18;
      ctx.fill();
      ctx.restore();
    });
  }

  // Draw orb only (clear orb area, then draw orb)
  function drawOrbAtPixel(x, y) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const orbRadius = TILE_SIZE * 0.35;
    // Clear orb area (slightly larger than orb)
    ctx.clearRect(x - orbRadius - 4, y - orbRadius - 4, orbRadius * 2 + 8, orbRadius * 2 + 8);
    // Redraw maze under orb (to avoid trails)
    drawMazeStatic();
    // Draw orb
    const gradient = ctx.createRadialGradient(x, y, orbRadius * 0.3, x, y, orbRadius);
    gradient.addColorStop(0, '#aef6ff');
    gradient.addColorStop(0.5, '#3ecfff');
    gradient.addColorStop(1, 'rgba(30,80,255,0.08)');
    ctx.save();
    ctx.globalAlpha = 0.95;
    ctx.beginPath();
    ctx.arc(x, y, orbRadius, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.shadowColor = '#3ecfff';
    ctx.shadowBlur = 32;
    ctx.fill();
    ctx.restore();
  }

  // On mount, draw maze and set orb pixel position
  useEffect(() => {
    drawMazeStatic();
    const { offsetX, offsetY } = mazeOffsets.current;
    setOrbPixel({
      x: offsetX + (orbPos.x + 0.5) * TILE_SIZE,
      y: offsetY + (orbPos.y + 0.5) * TILE_SIZE,
    });
    // eslint-disable-next-line
  }, []);

  // Animate orb movement when orbPos changes
  useEffect(() => {
    const { offsetX, offsetY } = mazeOffsets.current;
    const target = {
      x: offsetX + (orbPos.x + 0.5) * TILE_SIZE,
      y: offsetY + (orbPos.y + 0.5) * TILE_SIZE,
    };
    let animationFrame;
    function animate() {
      setOrbPixel(prev => {
        const dx = target.x - prev.x;
        const dy = target.y - prev.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 2) return target;
        const step = 0.18; // Animation speed
        return {
          x: prev.x + dx * step,
          y: prev.y + dy * step,
        };
      });
      animationFrame = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(animationFrame);
    // eslint-disable-next-line
  }, [orbPos]);

  // Redraw orb at new pixel position
  useEffect(() => {
    drawOrbAtPixel(orbPixel.x, orbPixel.y);
    // eslint-disable-next-line
  }, [orbPixel]);

  // Voice control effect (Dutch)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (!voiceEnabled) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'nl-NL';
    recognition.start();
    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      let dx = 0, dy = 0;
      if (transcript.includes('vooruit')) dy = -1;
      else if (transcript.includes('achteruit')) dy = 1;
      else if (transcript.includes('links')) dx = -1;
      else if (transcript.includes('rechts')) dx = 1;
      if (dx !== 0 || dy !== 0) {
        const newX = orbPos.x + dx;
        const newY = orbPos.y + dy;
        if (
          newY >= 0 && newY < MAZE.length &&
          newX >= 0 && newX < MAZE[0].length &&
          MAZE[newY][newX] === 0
        ) {
          setOrbPos({ x: newX, y: newY });
        }
      }
    };
    return () => recognition.abort();
    // eslint-disable-next-line
  }, [orbPos, voiceEnabled, voiceSession]);

  // Handle keyboard input for arrow keys
  useEffect(() => {
    function handleKeyDown(e) {
      let dx = 0, dy = 0;
      if (e.key === 'ArrowUp') dy = -1;
      else if (e.key === 'ArrowDown') dy = 1;
      else if (e.key === 'ArrowLeft') dx = -1;
      else if (e.key === 'ArrowRight') dx = 1;
      else return;
      e.preventDefault();
      const newX = orbPos.x + dx;
      const newY = orbPos.y + dy;
      // Check bounds and walls
      if (
        newY >= 0 && newY < MAZE.length &&
        newX >= 0 && newX < MAZE[0].length &&
        MAZE[newY][newX] === 0
      ) {
        setOrbPos({ x: newX, y: newY });
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [orbPos]);

  // Check na elke beweging of speler op een mini-game punt staat
  useEffect(() => {
    const idx = MINI_GAME_POINTS.findIndex(pt => pt.x === orbPos.x && pt.y === orbPos.y);
    if (idx !== -1 && activeMiniGame === null && !completedPoints[idx]) {
      setActiveMiniGame(idx);
      // pause movement voice control while mini-game is active
      setVoiceEnabled(false);
    }
  }, [orbPos, activeMiniGame, completedPoints]);

  return (
    <main className={styles.container}>
      <div className={styles.mist}>
        <div className={styles.mistLayer}></div>
        <div className={styles.mistLayer2}></div>
        <div className={styles.mistLayer3}></div>
      </div>
      {showInstruction && (
        <div className={mazeStyles.popupOverlay}>
          <div className={mazeStyles.popupContent}>
            <h2 className={mazeStyles.popupTitle}>Stem Labyrint</h2>
            <p className={mazeStyles.popupText}>
              Zeg: <b>"vooruit", "achteruit", "links", "rechts"</b><br />
              om de blauwe bol te bewegen
            </p>
            <button className={mazeStyles.popupButton} onClick={() => setShowInstruction(false)}>
              Begrepen!
            </button>
          </div>
        </div>
      )}
      {activeMiniGame === 0 && (
        <EchoChamberMiniGame
          onClose={() => {
            setActiveMiniGame(null);
            setVoiceEnabled(true);
            setVoiceSession(s => s + 1);
          }}
          onComplete={(success) => {
            if (success && activeMiniGame !== null) {
              setCompletedPoints(prev => prev.map((v, i) => (i === activeMiniGame ? true : v)));
            }
            setActiveMiniGame(null);
            setVoiceEnabled(true);
            setVoiceSession(s => s + 1);
            requestAnimationFrame(() => {
              drawMazeStatic();
              drawOrbAtPixel(orbPixel.x, orbPixel.y);
            });
          }}
        />
      )}
      {activeMiniGame === 1 && (
        <RhymeTowerMiniGame
          onClose={() => {
            setActiveMiniGame(null);
            setVoiceEnabled(true);
            setVoiceSession(s => s + 1);
          }}
          onComplete={(success) => {
            if (success && activeMiniGame !== null) {
              setCompletedPoints(prev => prev.map((v, i) => (i === activeMiniGame ? true : v)));
            }
            setActiveMiniGame(null);
            setVoiceEnabled(true);
            setVoiceSession(s => s + 1);
            requestAnimationFrame(() => {
              drawMazeStatic();
              drawOrbAtPixel(orbPixel.x, orbPixel.y);
            });
          }}
        />
      )}
      {activeMiniGame === 2 && (
        <MemoryPalaceMiniGame
          onClose={() => {
            setActiveMiniGame(null);
            setVoiceEnabled(true);
            setVoiceSession(s => s + 1);
          }}
          onComplete={(success) => {
            if (success && activeMiniGame !== null) {
              setCompletedPoints(prev => prev.map((v, i) => (i === activeMiniGame ? true : v)));
            }
            setActiveMiniGame(null);
            setVoiceEnabled(true);
            setVoiceSession(s => s + 1);
            requestAnimationFrame(() => {
              drawMazeStatic();
              drawOrbAtPixel(orbPixel.x, orbPixel.y);
            });
          }}
        />
      )}
      <Fireflies />
      <canvas ref={canvasRef} style={{ display: 'block', zIndex: 2, position: 'relative', margin: '0 auto' }} />
      
      {showWinScreen && (
        <div className={mazeStyles.winOverlay}>
          <div className={mazeStyles.winContent}>
            <div className={mazeStyles.winOrb}></div>
            <h2 className={mazeStyles.winTitle}>Gefeliciteerd!</h2>
            <div className={mazeStyles.winText}>
              <p>Het lichtje hoort bij de <strong>Bewakers van Balans</strong>: wezens die kinderen helpen om rustig te worden, beter te praten en zich sterk te voelen.</p>
              <p>Maar de bol is zijn kracht kwijtgeraakt...</p>
              <p className={mazeStyles.winHighlight}>Nu is het lichtje zijn kracht weer terug!</p>
            </div>
            <button className={mazeStyles.winButton} onClick={() => window.location.reload()}>
              Opnieuw Spelen
            </button>
          </div>
        </div>
      )}
    </main>
  );
}