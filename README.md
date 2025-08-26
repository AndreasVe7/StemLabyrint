# 🎮 StemLabyrint - Magische Stemgestuurde Spelwereld

<div align="center">
  <img src="public/Group 1 (3).png" alt="StemLabyrint Logo" width="200" height="200">
  
  [![Installatie Video](https://img.shields.io/badge/📹-Installatie_Video-red?style=for-the-badge)](https://youtu.be/MrfH1naLRok)
  [![Next.js](https://img.shields.io/badge/Next.js-15.4.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.1.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![Three.js](https://img.shields.io/badge/Three.js-0.155.0-000000?style=for-the-badge&logo=three.js)](https://threejs.org/)
</div>


## 🎯 Wat is StemLabyrint?

StemLabyrint is een interactieve, stemgestuurde spelwereld gebouwd met Next.js en Three.js. Het is ontworpen om kinderen te helpen met spraakontwikkeling, ademhalingsoefeningen en ontspanning door middel van een magische kasteelomgeving waar hun stem de weg wijst.

### ✨ Hoofdfuncties
- **Stemgestuurde navigatie** - Beweeg door het labyrint met spraakcommando's
- **3D kasteelomgeving** - Volledig gerenderde wereld met Three.js
- **Interactieve elementen** - Geheime kamers, puzzels en mini-games
- **Ademhalingsoefeningen** - Rustgevende activiteiten voor kinderen
- **Responsive design** - Werkt op desktop en mobiele apparaten

---

## 🚀 Installatie & Setup

### 📋 Vereisten
- **Node.js** 18.17 of hoger
- **npm** 9.0 of hoger (of yarn/pnpm)
- **Moderne browser** met WebGL ondersteuning
- **Microfoon** voor stemherkenning

### 🔧 Stap-voor-stap Installatie

#### 1. Repository Klonen
```bash
git clone https://github.com/jouw-username/stemlabyrint.git
cd stemlabyrint
```

#### 2. Dependencies Installeren
```bash
npm install
# of
yarn install
# of
pnpm install
```

#### 3. Ontwikkelingsserver Starten
```bash
npm run dev
# of
yarn dev
# of
pnpm dev
```

#### 4. Browser Openen
Open [http://localhost:3000](http://localhost:3000) in je browser

---

## 🏗️ Projectstructuur

```
stemlabyrint/
├── public/                 # Statische bestanden
│   ├── textures/          # 3D texturen
│   ├── *.mp3             # Audio bestanden
│   └── *.png, *.jpg      # Afbeeldingen
├── src/
│   └── app/              # Next.js app directory
│       ├── page.js        # Hoofdpagina
│       ├── tutorial/      # Tutorial pagina
│       ├── test-maze/     # Test labyrint
│       ├── test-voice/    # Stemtest
│       └── globals.css    # Globale styling
├── package.json           # Dependencies & scripts
└── README.md             # Deze instructable
```

---

## 💻 Code Uitleg

### 🎵 Audio Implementatie
```javascript
// Audio wordt automatisch gestart na eerste gebruikersinteractie
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
```

**Waarom deze aanpak?**
- Moderne browsers blokkeren autoplay van audio
- Gebruiker moet eerst interactie hebben gehad
- Graceful fallback als audio niet kan starten

### 🎮 Maze Game Mechanica
```javascript
// src/app/test-maze/page.js
const MAZE = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  // ... meer maze data
];

// Maze rendering met Canvas 2D
function drawMazeStatic() {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  
  // Teken muren en gangen
  for (let x = 0; x <= mazeCols; x++) {
    for (let y = 0; y < mazeRows; y++) {
      if (MAZE[y][x] === 1) {
        ctx.fillStyle = WALL_COLOR;
        ctx.fillRect(offsetX + x * TILE_SIZE, offsetY + y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
  }
}
```

**Technische details:**
- Maze wordt opgeslagen als 2D array (0 = gang, 1 = muur)
- Canvas 2D rendering voor betere performance dan DOM elementen
- Responsive maze die zich aanpast aan schermgrootte

### 🎯 Mini-Game Systeem
```javascript
// Mini-game punten in de maze
const MINI_GAME_POINTS = [
  { x: 5, y: 5, type: 'candle-game' },
  { x: 15, y: 10, type: 'breathing-exercise' },
  { x: 25, y: 20, type: 'voice-training' }
];

// Mini-game activatie
const [activeMiniGame, setActiveMiniGame] = useState(null);
const [completedPoints, setCompletedPoints] = useState(MINI_GAME_POINTS.map(() => false));

// Check of speler bij een mini-game punt is
useEffect(() => {
  MINI_GAME_POINTS.forEach((point, idx) => {
    if (orbPos.x === point.x && orbPos.y === point.y && !completedPoints[idx]) {
      setActiveMiniGame(idx);
    }
  });
}, [orbPos, completedPoints]);
```

**Game design principes:**
- Modulaire mini-game architectuur
- State management voor game progressie
- Collision detection tussen speler en game punten

### 🗣️ Voice Recognition Implementatie
```javascript
// src/app/test-voice/page.js
const [isListening, setIsListening] = useState(false);
const [transcript, setTranscript] = useState('');

useEffect(() => {
  if (!('webkitSpeechRecognition' in window)) {
    console.log('Speech recognition not supported');
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'nl-NL';

  recognition.onresult = (event) => {
    let finalTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      }
    }
    setTranscript(finalTranscript);
  };
}, []);
```

**Voice recognition features:**
- Nederlandse taal ondersteuning
- Real-time transcriptie
- Fallback voor browsers zonder speech recognition
- Continuous listening mode

### 🎨 3D Rendering met React Three Fiber
```javascript
// src/app/page.js - 3D Scene setup
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';

export default function HomeScreen() {
  return (
    <div className={styles.container}>
      <Canvas
        camera={{ position: [0, 5, 10], fov: 75 }}
        shadows
        gl={{ antialias: true }}
      >
        <Environment preset="sunset" />
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        {/* 3D Objecten */}
        <Castle />
        <Fireflies />
        <Ground />
        
        <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2} />
      </Canvas>
    </div>
  );
}
```

**3D Scene optimalisatie:**
- Shadow mapping voor realistische verlichting
- Environment maps voor sfeervolle belichting
- Orbit controls met beperkingen voor betere UX
- Performance optimalisatie met React Three Fiber

### 🔄 State Management Architectuur
```javascript
// Hoofdcomponent state structuur
const [gameState, setGameState] = useState({
  currentLevel: 1,
  completedMiniGames: [],
  playerProgress: 0,
  audioSettings: {
    musicVolume: 0.7,
    sfxVolume: 1.0,
    muted: false
  }
});

// Custom hook voor game state
const useGameState = () => {
  const [state, setState] = useState(initialGameState);
  
  const updateProgress = (miniGameId) => {
    setState(prev => ({
      ...prev,
      completedMiniGames: [...prev.completedMiniGames, miniGameId],
      playerProgress: calculateProgress(prev.completedMiniGames.length + 1)
    }));
  };
  
  return [state, updateProgress];
};
```

**State management principes:**
- Centralized state voor game progressie
- Immutable updates voor betere performance
- Custom hooks voor herbruikbare logica
- LocalStorage voor persistentie

### 🌟 Fireflies Effect
```javascript
// src/app/Fireflies.js
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

export default function Fireflies() {
  const firefliesRef = useRef();
  
  useFrame((state) => {
    // Animatielogica voor vuurvliegjes
    firefliesRef.current.children.forEach((firefly, i) => {
      // Beweeg elk vuurvliegje
    });
  });
  
  return (
    <group ref={firefliesRef}>
      {/* Vuurvliegjes geometrie */}
    </group>
  );
}
```

**Technische details:**
- Gebruikt React Three Fiber voor 3D rendering
- `useFrame` hook voor 60fps animaties
- Performance geoptimaliseerd met refs

### 🎨 Component Architectuur & Styling
```javascript
// Component structuur voor herbruikbaarheid
const MiniGameWrapper = ({ children, onComplete, isActive }) => {
  const [isCompleted, setIsCompleted] = useState(false);
  
  const handleComplete = () => {
    setIsCompleted(true);
    onComplete?.();
  };
  
  return (
    <div className={`${styles.miniGameWrapper} ${isActive ? styles.active : ''}`}>
      {!isCompleted ? children : <div className={styles.completed}>Voltooid! ✓</div>}
    </div>
  );
};

// CSS Module implementatie
const styles = {
  miniGameWrapper: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'rgba(0, 0, 0, 0.9)',
    borderRadius: '12px',
    padding: '24px',
    zIndex: 1000,
    transition: 'all 0.3s ease-in-out'
  },
  active: {
    opacity: 1,
    transform: 'translate(-50%, -50%) scale(1)'
  },
  completed: {
    color: '#4CAF50',
    fontSize: '18px',
    fontWeight: 'bold',
    textAlign: 'center'
  }
};
```

**Component design principes:**
- Composable componenten voor herbruikbaarheid
- CSS Modules voor scoped styling
- Props interface voor flexibele configuratie
- State management per component

### 🔧 Performance Optimalisatie Technieken
```javascript
// Memoization voor zware berekeningen
const memoizedMazeData = useMemo(() => {
  return MAZE.map(row => row.map(cell => ({
    ...cell,
    distance: calculateDistance(cell, playerPosition)
  })));
}, [playerPosition]);

// Debounced input handling
const debouncedVoiceInput = useCallback(
  debounce((input) => {
    processVoiceCommand(input);
  }, 300),
  []
);

// Lazy loading van componenten
const LazyMiniGame = lazy(() => import('./MiniGame'));
const LazyTutorial = lazy(() => import('./Tutorial'));

// Suspense wrapper
<Suspense fallback={<div>Laden...</div>}>
  {showMiniGame && <LazyMiniGame />}
</Suspense>
```

**Performance verbeteringen:**
- React.memo voor onnodige re-renders voorkomen
- useMemo voor dure berekeningen
- Lazy loading voor code splitting
- Debouncing voor gebruikersinput

### 🎭 State Management
```javascript
const [showBook, setShowBook] = useState(false);
const [navigating, setNavigating] = useState(false);
const [muted, setMuted] = useState(false);
const [introStep, setIntroStep] = useState(1);
```

**State structuur:**
- `showBook`: Toont/verbergt het introductieboek
- `navigating`: Voorkomt dubbele navigatie
- `muted`: Audio mute status
- `introStep`: Huidige stap in de introductie

---

## 🎨 Styling & CSS Modules

### CSS Module Structuur
```css
/* HomeScreen.module.css */
.container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.mist {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
```

**Voordelen van CSS Modules:**
- Scoped styling (geen conflicten)
- Type-safe in TypeScript
- Betere performance dan styled-components

---

## 🔧 Configuratie Bestanden

### Next.js Configuratie
```javascript
// next.config.mjs
const nextConfig = {
  experimental: {
    turbo: true, // Turbopack voor snellere builds
  },
};

export default nextConfig;
```

### ESLint Configuratie
```javascript
// eslint.config.mjs
import js from '@eslint/js';
import nextPlugin from '@eslint/eslintrc';

export default [
  js.configs.recommended,
  ...nextPlugin.configs.recommended,
];
```

---

## 🚨 Valkuilen & Oplossingen

### ❌ Veelvoorkomende Problemen

#### 1. Audio Autoplay Blokkering
**Probleem:** Audio start niet automatisch
```javascript
// ❌ Dit werkt niet in moderne browsers
<audio autoPlay src="/medieval.mp3" />

// ✅ Gebruik event listeners
useEffect(() => {
  const startAudio = () => audioRef.current?.play();
  window.addEventListener('click', startAudio);
  return () => window.removeEventListener('click', startAudio);
}, []);
```

#### 2. Three.js Performance Issues
**Probleem:** Lage framerate in 3D scene
```javascript
// ❌ Te veel objecten renderen
{Array(1000).fill().map((_, i) => <mesh key={i} />)}

// ✅ Gebruik instancing of object pooling
const instancedMesh = useMemo(() => {
  return new THREE.InstancedMesh(geometry, material, 1000);
}, []);
```

#### 3. Mobile Responsiveness
**Probleem:** 3D scene werkt niet goed op mobiel
```css
/* ✅ Voeg touch-friendly controls toe */
@media (max-width: 768px) {
  .controls {
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }
}
```

### 💡 Tips & Best Practices

#### Performance Optimalisatie
```javascript
// ✅ Gebruik React.memo voor zware componenten
const HeavyComponent = React.memo(({ data }) => {
  // Component logica
});

// ✅ Debounce gebruikersinput
const debouncedSearch = useMemo(
  () => debounce(searchFunction, 300),
  []
);
```

#### Accessibility
```javascript
// ✅ Voeg ARIA labels toe
<button 
  aria-label="Start het spel"
  aria-describedby="game-description"
>
  Start
</button>
```

---

## 🎮 Maker Bestanden

### 📁 Assets Organisatie
```
public/
├── audio/           # Alle geluidsbestanden
│   ├── background/  # Achtergrondmuziek
│   ├── sfx/         # Sound effects
│   └── voice/       # Spraakbestanden
├── models/          # 3D modellen (.glb/.gltf)
├── textures/        # 2D texturen
└── images/          # UI afbeeldingen
```

### 🎨 Custom Textures Maken
```bash
# Gebruik Blender of online tools voor texturen
# Aanbevolen formaten: 512x512, 1024x1024
# Compressie: WebP voor web, PNG voor transparantie
```

### 🔊 Audio Optimalisatie
```bash
# Converteer naar WebM/MP3 voor web
ffmpeg -i input.wav -c:a libmp3lame -b:a 128k output.mp3

# Optimaliseer voor streaming
ffmpeg -i input.wav -c:a aac -b:a 96k -movflags +faststart output.m4a
```

---

## 🚀 Deployment

### Vercel (Aanbevolen)
```bash
# 1. Installeer Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Volg de prompts
```

### Netlify
```bash
# 1. Build het project
npm run build

# 2. Upload de 'out' folder naar Netlify
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🧪 Testing

### Development Testing
```bash
# Start development server
npm run dev

# Open in verschillende browsers
# Test op verschillende schermgroottes
# Controleer console voor errors
```

### Build Testing
```bash
# Test production build
npm run build
npm run start

# Controleer performance
# Test alle functionaliteiten
```

---


