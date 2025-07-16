"use client";
import styles from './HomeScreen.module.css';
import Fireflies from './Fireflies';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  return (
    <main className={styles.container}>
      <div className={styles.mist}>
        <div className={styles.mistLayer}></div>
        <div className={styles.mistLayer2}></div>
        <div className={styles.mistLayer3}></div>
      </div>
      <Fireflies />
      <h1 className={styles.title}>StemLabyrint</h1>
      <span style={{position: 'absolute', left: '-9999px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden'}}>StemLabyrint magical voice maze homescreen</span>
      <p className={styles.subtitle}>Navigate the glowing orb with your voice. Explore, learn, and play in a magical world.</p>
      <button className={styles.startButton} aria-label="Enter the magical forest" onClick={() => router.push('/tutorial')}>Enter</button>
    </main>
  );
}
