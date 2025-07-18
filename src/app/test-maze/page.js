'use client';
import React, { useEffect, useRef, useState } from 'react';
import styles from '../HomeScreen.module.css';
import Fireflies from '../Fireflies';

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
    MINI_GAME_POINTS.forEach(({ x, y }) => {
      const mgX = offsetX + (x + 0.5) * TILE_SIZE;
      const mgY = offsetY + (y + 0.5) * TILE_SIZE;
      const mgRadius = TILE_SIZE * 0.22;
      const mgGradient = ctx.createRadialGradient(mgX, mgY, mgRadius * 0.2, mgX, mgY, mgRadius);
      mgGradient.addColorStop(0, '#ffe066');
      mgGradient.addColorStop(0.5, '#ffd700');
      mgGradient.addColorStop(1, 'rgba(255, 224, 102, 0.08)');
      ctx.save();
      ctx.globalAlpha = 0.92;
      ctx.beginPath();
      ctx.arc(mgX, mgY, mgRadius, 0, 2 * Math.PI);
      ctx.fillStyle = mgGradient;
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 18;
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
  }, [orbPos]);

  return (
    <main className={styles.container}>
      <div className={styles.mist}>
        <div className={styles.mistLayer}></div>
        <div className={styles.mistLayer2}></div>
        <div className={styles.mistLayer3}></div>
      </div>
      <Fireflies />
      <canvas ref={canvasRef} style={{ display: 'block', zIndex: 2, position: 'relative', margin: '0 auto' }} />
      <div style={{position:'fixed',top:20,left:20,background:'#23243a',color:'#fff',padding:'10px 18px',borderRadius:8,opacity:0.92,zIndex:10}}>
        <b>Zeg:</b> "vooruit", "achteruit", "links", "rechts"<br/>
        <span style={{fontSize:12,opacity:0.7}}>om de blauwe bol te bewegen</span>
      </div>
    </main>
  );
} 