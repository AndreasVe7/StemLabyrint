# 🎮 StemLabyrint - Magische Stemgestuurde Spelwereld

<div align="center">
  <img src="public/Group 1 (3).png" alt="StemLabyrint Logo" width="200" height="200">
  
  [![Installatie Video](https://img.shields.io/badge/📹-Installatie_Video-red?style=for-the-badge)](https://youtu.be/your-video-id)
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


