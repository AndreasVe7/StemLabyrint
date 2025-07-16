'use client';
import React, { useEffect, useRef } from 'react';
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

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const mazeRows = MAZE.length;
    const mazeCols = MAZE[0].length;
    const mazeWidth = mazeCols * TILE_SIZE;
    const mazeHeight = mazeRows * TILE_SIZE;

    // Center the maze
    const offsetX = (canvas.width - mazeWidth) / 2;
    const offsetY = (canvas.height - mazeHeight) / 2;

    // Draw maze background
    ctx.fillStyle = MAZE_BG;
    ctx.fillRect(offsetX, offsetY, mazeWidth, mazeHeight);

    // Draw vertical walls
    for (let x = 0; x <= mazeCols; x++) {
      for (let y = 0; y < mazeRows; y++) {
        if (x === 0 || x === mazeCols || MAZE[y][x - 1] === 1 || (x < mazeCols && MAZE[y][x] === 1)) {
          // Wall body
          ctx.fillStyle = WALL_COLOR;
          ctx.fillRect(
            offsetX + x * TILE_SIZE - WALL_THICKNESS / 2,
            offsetY + y * TILE_SIZE,
            WALL_THICKNESS,
            TILE_SIZE
          );
          // Shadow
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
          // Wall body
          ctx.fillStyle = WALL_COLOR;
          ctx.fillRect(
            offsetX + x * TILE_SIZE,
            offsetY + y * TILE_SIZE - WALL_THICKNESS / 2,
            TILE_SIZE,
            WALL_THICKNESS
          );
          // Shadow
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

    // Find the center-most corridor cell
    const { x: orbCellX, y: orbCellY } = findCenterCorridorCell(MAZE);
    // Draw glowing blue orb in the center corridor cell
    const orbRadius = TILE_SIZE * 0.35;
    const orbX = offsetX + (orbCellX + 0.5) * TILE_SIZE;
    const orbY = offsetY + (orbCellY + 0.5) * TILE_SIZE;
    const gradient = ctx.createRadialGradient(orbX, orbY, orbRadius * 0.3, orbX, orbY, orbRadius);
    gradient.addColorStop(0, '#aef6ff');
    gradient.addColorStop(0.5, '#3ecfff');
    gradient.addColorStop(1, 'rgba(30,80,255,0.08)');
    ctx.save();
    ctx.globalAlpha = 0.95;
    ctx.beginPath();
    ctx.arc(orbX, orbY, orbRadius, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.shadowColor = '#3ecfff';
    ctx.shadowBlur = 32;
    ctx.fill();
    ctx.restore();

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
  }, []);

  return (
    <main className={styles.container}>
      <div className={styles.mist}>
        <div className={styles.mistLayer}></div>
        <div className={styles.mistLayer2}></div>
        <div className={styles.mistLayer3}></div>
      </div>
      <Fireflies />
      <canvas ref={canvasRef} style={{ display: 'block', zIndex: 2, position: 'relative', margin: '0 auto' }} />
    </main>
  );
} 