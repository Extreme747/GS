import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Heart,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  Lock,
  Unlock,
  Send,
} from 'lucide-react';
import confetti from 'canvas-confetti';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
export type CardStage = 1 | 2 | 3 | 4 | 5;

interface FloatingHeart {
  id: number;
  left: string;
  size: number;
  duration: string;
  delay: string;
  opacity: number;
}

interface BouquetFlower {
  id: number;
  name: string;
  color: string;
  accent: string;
  note: string;
  x: number;
  y: number;
  rotate: number;
}

interface FlipCardItem {
  id: number;
  tag: string;
  frontTitle: string;
  frontEmoji: string;
  backNote: string;
  gradient: string;
}

interface CatchHeart {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  caught: boolean;
  word: string;
}

// ============================================================================
// WEB AUDIO SYNTHESIZER (Playful Romantic Chimes & Heartbeat Pop)
// ============================================================================
class RomanticSoundEngine {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  private getCtx(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public playNote(freq = 523.25, duration = 0.5, type: OscillatorType = 'sine', vol = 0.06) {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.15, now + duration * 0.8);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // ignore audio restrictions
    }
  }

  public playRomanticChord() {
    const notes = [523.25, 659.25, 783.99, 987.77, 1046.5];
    notes.forEach((n, i) => {
      setTimeout(() => this.playNote(n, 0.9, 'sine', 0.05), i * 75);
    });
  }

  public playPop() {
    this.playNote(680, 0.18, 'triangle', 0.08);
  }
}

const sfx = new RomanticSoundEngine();

// ============================================================================
// CELEBRATION CONFETTI
// ============================================================================
const triggerCelebrationConfetti = () => {
  try {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#fda4af', '#f43f5e', '#fbbf24', '#f472b6', '#e11d48'],
    });
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#f43f5e', '#fbbf24', '#fda4af'],
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#f43f5e', '#fbbf24', '#fda4af'],
      });
    }, 300);
  } catch {
    // ignore
  }
};

// ============================================================================
// AMBIENT ROMANTIC BACKGROUND (Floating Hearts + Warm Rose/Gold Glow)
// ============================================================================
const RomanticBackground: React.FC<{ stage: CardStage; celebration: boolean }> = ({
  stage,
  celebration,
}) => {
  const hearts: FloatingHeart[] = useMemo(() => {
    return Array.from({ length: 22 }).map((_, i) => ({
      id: i,
      left: `${((i * 41 + 9) % 94) + 3}%`,
      size: 10 + (i % 4) * 5,
      duration: `${9 + (i % 7) * 2.2}s`,
      delay: `${(i * 0.6) % 7}s`,
      opacity: 0.12 + (i % 5) * 0.06,
    }));
  }, []);

  const bgGradient: Record<CardStage, string> = {
    1: 'radial-gradient(circle at 50% 35%, rgba(159, 18, 57, 0.35) 0%, rgba(76, 5, 25, 0.25) 45%, #0c040a 100%)',
    2: 'radial-gradient(circle at 50% 45%, rgba(190, 24, 93, 0.32) 0%, rgba(88, 28, 135, 0.22) 50%, #0c040a 100%)',
    3: 'radial-gradient(circle at 50% 40%, rgba(225, 29, 72, 0.30) 0%, rgba(112, 26, 117, 0.22) 50%, #0c040a 100%)',
    4: 'radial-gradient(circle at 50% 50%, rgba(217, 119, 6, 0.25) 0%, rgba(159, 18, 57, 0.26) 50%, #0c040a 100%)',
    5: celebration
      ? 'radial-gradient(circle at 50% 45%, rgba(244, 63, 94, 0.48) 0%, rgba(192, 38, 211, 0.28) 52%, #0c040a 100%)'
      : 'radial-gradient(circle at 50% 45%, rgba(190, 18, 60, 0.34) 0%, rgba(76, 29, 149, 0.22) 50%, #0c040a 100%)',
  };

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none transition-all duration-1000"
      style={{ background: bgGradient[stage] }}
      aria-hidden="true"
    >
      {/* Warm ambient bokeh circles */}
      <div
        className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl opacity-25 transition-all duration-1000"
        style={{ background: 'radial-gradient(circle, #fb7185 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-25 transition-all duration-1000"
        style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }}
      />

      {/* Rising Soft Hearts & Sparkles */}
      {hearts.map((h) => (
        <div
          key={h.id}
          className="floating-heart absolute bottom-[-40px]"
          style={{
            left: h.left,
            animationDuration: h.duration,
            animationDelay: h.delay,
            opacity: celebration ? Math.min(0.85, h.opacity * 2.4) : h.opacity,
          }}
        >
          {h.id % 3 === 0 ? (
            <span className="text-amber-200" style={{ fontSize: `${h.size}px` }}>
              ✦
            </span>
          ) : (
            <svg
              width={h.size}
              height={h.size}
              viewBox="0 0 24 24"
              fill={h.id % 2 === 0 ? '#fda4af' : '#f43f5e'}
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// STAGE 01: 3D WAX-SEALED ENVELOPE ("VIP Delivery for Gauri")
// ============================================================================
const EnvelopeStage: React.FC<{ onOpen: () => void }> = ({ onOpen }) => {
  const [sealBroken, setSealBroken] = useState(false);
  const [letterRising, setLetterRising] = useState(false);

  const handleBreakSeal = () => {
    if (sealBroken) return;
    sfx.playRomanticChord();
    setSealBroken(true);
    setTimeout(() => {
      setLetterRising(true);
    }, 450);
    setTimeout(() => {
      onOpen();
    }, 1750);
  };

  return (
    <section className="relative z-10 flex flex-col items-center justify-center px-4 py-8 min-h-[80vh] w-full max-w-lg mx-auto text-center">
      {/* Top Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-950/70 border border-rose-400/30 text-rose-200 text-xs tracking-widest uppercase mb-6 shadow-lg">
        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
        <span>Special Delivery · Top Secret</span>
      </div>

      <h1 className="font-serif-display text-3xl sm:text-5xl text-rose-50 mb-3 leading-tight">
        Ek Chhota Sa Surprise,{' '}
        <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-amber-200 to-pink-300">
          Gauri
        </span>{' '}
        💌
      </h1>
      <p className="text-sm sm:text-base text-rose-200/75 max-w-sm mb-8 font-light">
        Kisi ne tumhare liye bohot pyaar se ye digital card banwaya hai. Seal pe tap karke kholo!
      </p>

      {/* Interactive 3D Envelope */}
      <div className="relative w-80 sm:w-96 h-56 sm:h-64 my-4 flex items-center justify-center select-none">
        {/* Glow behind envelope */}
        <div
          className={`absolute inset-0 rounded-3xl blur-2xl transition-all duration-700 ${
            sealBroken ? 'bg-rose-500/40 scale-110' : 'bg-rose-600/20 scale-95'
          }`}
        />

        {/* Envelope Body */}
        <div
          onClick={handleBreakSeal}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleBreakSeal()}
          aria-label="Open wax sealed envelope for Gauri"
          className="relative w-full h-full rounded-2xl bg-gradient-to-br from-rose-900 via-rose-950 to-[#2a0818] border border-rose-300/30 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-visible flex items-center justify-center cursor-pointer group transition-transform duration-300 hover:scale-[1.02]"
        >
          {/* Rising Inner Letter Card */}
          <div
            className={`absolute left-5 right-5 rounded-xl bg-gradient-to-b from-amber-50 to-rose-50 text-rose-950 p-5 shadow-2xl border border-amber-200 transition-all duration-700 flex flex-col items-center justify-center ${
              letterRising
                ? '-translate-y-20 opacity-100 scale-105 z-30'
                : 'translate-y-4 opacity-0 scale-95 pointer-events-none z-10'
            }`}
          >
            <span className="text-[10px] uppercase tracking-widest text-rose-500 font-semibold mb-1">
              For Someone Special
            </span>
            <p className="font-serif-display text-xl sm:text-2xl font-bold text-rose-900">
              Hey Beautiful, Gauri! ✨
            </p>
            <p className="text-xs text-rose-700 mt-1">
              Get ready for a tiny rollercoaster of cute moments...
            </p>
          </div>

          {/* Envelope Bottom/Side Flaps (SVG) */}
          <svg
            viewBox="0 0 400 260"
            className="absolute inset-0 w-full h-full rounded-2xl pointer-events-none z-20"
            preserveAspectRatio="none"
          >
            {/* Left & Right Triangles */}
            <polygon points="0,0 200,140 0,260" fill="rgba(136, 19, 55, 0.85)" />
            <polygon points="400,0 200,140 400,260" fill="rgba(112, 16, 46, 0.85)" />
            {/* Bottom Flap */}
            <polygon
              points="0,260 200,130 400,260"
              fill="rgba(159, 18, 57, 0.95)"
              stroke="rgba(253, 164, 175, 0.25)"
              strokeWidth="1.5"
            />
          </svg>

          {/* Top Opening Flap */}
          <svg
            viewBox="0 0 400 150"
            className={`absolute top-0 left-0 w-full h-36 pointer-events-none transition-all duration-700 origin-top ${
              sealBroken ? '[transform:rotateX(180deg)] -translate-y-2 opacity-40 z-0' : 'z-20'
            }`}
            preserveAspectRatio="none"
          >
            <polygon
              points="0,0 200,145 400,0"
              fill="rgba(190, 18, 60, 0.96)"
              stroke="rgba(253, 164, 175, 0.35)"
              strokeWidth="1.5"
            />
          </svg>

          {/* Interactive Gold/Crimson Wax Seal Button */}
          <div
            className={`relative z-30 flex flex-col items-center transition-all duration-500 ${
              sealBroken ? 'scale-150 opacity-0 pointer-events-none' : 'scale-100 opacity-100'
            }`}
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-300 via-rose-600 to-rose-900 p-1 shadow-[0_0_30px_rgba(251,113,133,0.8)] group-hover:scale-110 transition-transform flex items-center justify-center border-2 border-amber-200/80 animate-pulse">
              <div className="w-full h-full rounded-full border border-dashed border-amber-100/60 flex flex-col items-center justify-center bg-rose-800/90">
                <Heart className="w-7 h-7 text-amber-200 fill-amber-200" />
                <span className="text-[9px] font-bold tracking-widest text-amber-100 mt-0.5">
                  GAURI
                </span>
              </div>
            </div>
            <span className="mt-3 px-3 py-1 rounded-full bg-black/50 border border-rose-300/30 text-xs text-amber-200 font-medium shadow">
              Tap Seal to Open ✨
            </span>
          </div>
        </div>
      </div>

      {/* Quick Skip / Open CTA */}
      <button
        type="button"
        onClick={handleBreakSeal}
        className="mt-6 inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium text-rose-950 bg-gradient-to-r from-amber-200 via-rose-200 to-amber-200 hover:brightness-110 shadow-[0_0_25px_rgba(251,113,133,0.5)] active:scale-95 transition-all cursor-pointer"
      >
        <span>Lifafa Kholo (Open Card)</span>
        <Heart className="w-4 h-4 fill-rose-600 text-rose-600" />
      </button>
    </section>
  );
};

// ============================================================================
// STAGE 02: INTERACTIVE COMPLIMENT & REASON CARDS ("Why You're So Special")
// ============================================================================
const FLIP_CARDS: FlipCardItem[] = [
  {
    id: 1,
    tag: 'Reason #01',
    frontTitle: 'Tumhari Smile 😊',
    frontEmoji: '🌸',
    backNote:
      'Sach mein Gauri, jab tum hasti ho toh aas-paas ka poora mood automatically 10x better ho jaata hai!',
    gradient: 'from-rose-500/30 to-pink-900/40',
  },
  {
    id: 2,
    tag: 'Reason #02',
    frontTitle: 'Tumhari Vibe ✨',
    frontEmoji: '🦋',
    backNote:
      'Thodi si cute, thodi si dramatic, aur 100% 21-topon-ki-salaami level adorable. Tumhare jaisa koi doosra piece nahi hai!',
    gradient: 'from-amber-500/30 to-rose-900/40',
  },
  {
    id: 3,
    tag: 'Reason #03',
    frontTitle: 'Best Notification 📱',
    frontEmoji: '💌',
    backNote:
      'Chahe din kitna bhi boring ya hectic kyun na ho, tumhara ek message poore din ki thakaan mita deta hai.',
    gradient: 'from-purple-500/30 to-rose-900/40',
  },
  {
    id: 4,
    tag: 'Reason #04',
    frontTitle: 'Pure Magic 🌙',
    frontEmoji: '👑',
    backNote:
      'Log kehte hain fairytale sirf movies mein hoti hai, par tumse milke lagta hai real life bhi kaafi filmy ho sakti hai!',
    gradient: 'from-pink-500/30 to-amber-900/40',
  },
];

const FlipCardsStage: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [loveMeter, setLoveMeter] = useState<number>(85);

  const toggleCard = (id: number) => {
    sfx.playPop();
    setFlippedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBoostMeter = () => {
    sfx.playRomanticChord();
    setLoveMeter((prev) => (prev >= 1000 ? 1000 : prev + 115));
  };

  return (
    <section className="relative z-10 flex flex-col items-center justify-center px-4 py-6 max-w-2xl mx-auto min-h-[80vh] w-full text-center">
      <span className="text-xs uppercase tracking-[0.25em] text-amber-300/80 mb-1">
        Page 01 · Dil Ki Baat
      </span>
      <h2 className="font-serif-display text-2xl sm:text-4xl text-rose-50 mb-2">
        4 Chhoti Si Baatein Tumhare Liye, <span className="italic text-rose-300">Gauri</span> 💖
      </h2>
      <p className="text-xs sm:text-sm text-rose-200/75 mb-5">
        Har card pe tap karo aur dekho andar kya likha hai ({flippedIds.length}/4 opened)
      </p>

      {/* 2x2 Grid of Interactive Flip Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full mb-6">
        {FLIP_CARDS.map((card) => {
          const isFlipped = flippedIds.includes(card.id);
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => toggleCard(card.id)}
              className={`group relative h-40 rounded-2xl p-5 text-left transition-all duration-500 border cursor-pointer flex flex-col justify-between overflow-hidden ${
                isFlipped
                  ? 'bg-gradient-to-br from-rose-950/90 via-rose-900/80 to-amber-950/80 border-amber-300/60 shadow-[0_0_25px_rgba(251,113,133,0.35)] scale-[1.01]'
                  : `bg-gradient-to-br ${card.gradient} border-rose-300/25 hover:border-rose-300/50`
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/35 text-amber-200 border border-amber-200/20">
                  {card.tag}
                </span>
                <span className="text-xl">{isFlipped ? '❤️' : card.frontEmoji}</span>
              </div>

              {!isFlipped ? (
                <div className="my-auto">
                  <h3 className="font-serif-display text-xl text-rose-50 font-semibold">
                    {card.frontTitle}
                  </h3>
                  <p className="text-xs text-rose-200/70 mt-1 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Tap to reveal secret note
                  </p>
                </div>
              ) : (
                <div className="my-auto fade-in-quick">
                  <p className="text-xs sm:text-sm text-amber-50 leading-relaxed font-light">
                    “{card.backNote}”
                  </p>
                </div>
              )}

              <div className="w-full flex justify-end">
                <span className="text-[10px] text-rose-300/70">
                  {isFlipped ? 'Tap to flip back' : 'Tap to open →'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Fun Cutie-Meter Booster */}
      <div className="w-full max-w-md rounded-2xl bg-rose-950/50 border border-rose-400/25 p-4 mb-6 flex items-center justify-between gap-4">
        <div className="text-left">
          <span className="text-[11px] uppercase tracking-wider text-rose-300 block">
            Gauri&apos;s Cuteness Meter 📈
          </span>
          <span className="text-lg font-bold text-amber-200">
            {loveMeter}% {loveMeter > 200 ? '🔥 Overload!' : '✨'}
          </span>
        </div>
        <button
          type="button"
          onClick={handleBoostMeter}
          className="px-4 py-2 rounded-full bg-rose-600/80 hover:bg-rose-500 text-xs font-medium text-white border border-rose-300/40 shadow active:scale-95 transition-all cursor-pointer"
        >
          Boost Meter +100% 🚀
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          sfx.playNote(659.25, 0.5);
          onNext();
        }}
        className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium text-rose-950 bg-gradient-to-r from-amber-200 via-rose-200 to-amber-200 shadow-[0_0_25px_rgba(251,113,133,0.45)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
      >
        <span>Chalo Aage Dekho (Next Surprise)</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </section>
  );
};

// ============================================================================
// STAGE 03: BUILD A BOUQUET FOR GAURI ("Har Phool Mein Ek Compliment")
// ============================================================================
const BOUQUET_FLOWERS: BouquetFlower[] = [
  {
    id: 1,
    name: 'Red Rose',
    color: '#e11d48',
    accent: '#fda4af',
    note: 'Ye laal gulaab tumhari pyari si muskaan ke naam! 🌹',
    x: 90,
    y: 95,
    rotate: -18,
  },
  {
    id: 2,
    name: 'Golden Lily',
    color: '#f59e0b',
    accent: '#fef3c7',
    note: 'Ye golden phool kyunki tumhari vibe ekdum sunshine jaisi hai! 🌻',
    x: 150,
    y: 75,
    rotate: 0,
  },
  {
    id: 3,
    name: 'Pink Tulip',
    color: '#ec4899',
    accent: '#fbcfe8',
    note: 'Ye pink phool tumhari cute si baaton aur nakhron ke liye! 🌸',
    x: 210,
    y: 95,
    rotate: 18,
  },
  {
    id: 4,
    name: 'Lavender Bloom',
    color: '#a855f7',
    accent: '#e9d5ff',
    note: 'Aur ye magical bloom kyunki tum sach mein one in a million ho! 💜',
    x: 120,
    y: 120,
    rotate: -8,
  },
  {
    id: 5,
    name: 'Coral Blossom',
    color: '#fb7185',
    accent: '#ffe4e6',
    note: 'Poora bouquet ready! Just like you—completely gorgeous, Gauri! 💐',
    x: 180,
    y: 120,
    rotate: 10,
  },
];

const BouquetStage: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const [bloomedCount, setBloomedCount] = useState<number>(1);
  const [activeNote, setActiveNote] = useState<string>(BOUQUET_FLOWERS[0].note);

  const handleAddFlower = () => {
    if (bloomedCount < BOUQUET_FLOWERS.length) {
      const nextIdx = bloomedCount;
      setBloomedCount(nextIdx + 1);
      setActiveNote(BOUQUET_FLOWERS[nextIdx].note);
      sfx.playRomanticChord();
    } else {
      sfx.playRomanticChord();
      setActiveNote('Full Bouquet Unlocked for Gauri! 🌸💐✨');
    }
  };

  return (
    <section className="relative z-10 flex flex-col items-center justify-center px-4 py-6 max-w-xl mx-auto min-h-[80vh] w-full text-center">
      <span className="text-xs uppercase tracking-[0.25em] text-amber-300/80 mb-1">
        Page 02 · Digital Guldasta
      </span>
      <h2 className="font-serif-display text-2xl sm:text-4xl text-rose-50 mb-1.5">
        Gauri Ke Liye Special Bouquet 💐
      </h2>
      <p className="text-xs sm:text-sm text-rose-200/75 mb-4">
        Asli phool toh murjha jaate hain, par ye digital bouquet hamesha fresh rahega! Tap karke phool add karo.
      </p>

      {/* SVG Interactive Bouquet Wrapper */}
      <div
        onClick={handleAddFlower}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleAddFlower()}
        className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center rounded-3xl bg-rose-950/35 border border-rose-300/25 shadow-[inset_0_0_40px_rgba(244,63,94,0.2)] cursor-pointer select-none group my-2"
      >
        <svg viewBox="0 0 300 300" className="w-full h-full overflow-visible">
          {/* Paper Bouquet Wrap Cone */}
          <polygon
            points="75,145 225,145 170,275 130,275"
            fill="#fce7f3"
            stroke="#f9a8d4"
            strokeWidth="2"
          />
          <polygon points="85,145 215,145 150,245" fill="#fbcfe8" opacity="0.7" />

          {/* Stems */}
          {BOUQUET_FLOWERS.slice(0, bloomedCount).map((fl) => (
            <line
              key={`stem-${fl.id}`}
              x1="150"
              y1="230"
              x2={fl.x}
              y2={fl.y}
              stroke="#15803d"
              strokeWidth="4"
              strokeLinecap="round"
            />
          ))}

          {/* Blooming Flower Heads */}
          {BOUQUET_FLOWERS.slice(0, bloomedCount).map((fl) => (
            <g
              key={fl.id}
              transform={`translate(${fl.x}, ${fl.y}) rotate(${fl.rotate})`}
              className="fade-in-quick"
            >
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <ellipse
                  key={deg}
                  cx="0"
                  cy="-16"
                  rx="9"
                  ry="18"
                  fill={fl.color}
                  stroke={fl.accent}
                  strokeWidth="1"
                  transform={`rotate(${deg})`}
                />
              ))}
              <circle cx="0" cy="0" r="9" fill="#fef08a" />
            </g>
          ))}

          {/* Ribbon Bow on Bouquet */}
          <path
            d="M 125 220 Q 150 232 175 220"
            fill="none"
            stroke="#e11d48"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <circle cx="150" cy="223" r="7" fill="#be123c" />
        </svg>

        <span className="absolute bottom-3 px-3 py-1 rounded-full bg-black/60 text-[11px] text-amber-200 border border-amber-200/30">
          {bloomedCount}/{BOUQUET_FLOWERS.length} Flowers Bloomed ✨
        </span>
      </div>

      {/* Compliment Banner */}
      <div className="min-h-[3.5rem] max-w-md mx-auto my-3 px-4 py-2.5 rounded-2xl bg-rose-900/40 border border-rose-300/30 flex items-center justify-center">
        <p className="text-sm sm:text-base text-amber-100 font-serif-display italic">
          “{activeNote}”
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
        {bloomedCount < BOUQUET_FLOWERS.length && (
          <button
            type="button"
            onClick={handleAddFlower}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium text-white bg-rose-600 hover:bg-rose-500 border border-rose-300/40 shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>Ek Aur Phool Add Karo ({bloomedCount}/5) 🌸</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            sfx.playNote(659.25, 0.5);
            onNext();
          }}
          className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-medium text-rose-950 bg-gradient-to-r from-amber-200 via-rose-200 to-amber-200 shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
        >
          <span>Next: Mini Game Khelte Hain →</span>
        </button>
      </div>
    </section>
  );
};

// ============================================================================
// STAGE 04: MINI-GAME ("Catch 5 Flying Hearts to Unlock the Secret Question")
// ============================================================================
const INITIAL_HEARTS: CatchHeart[] = [
  { id: 1, x: 20, y: 28, vx: 0.04, vy: 0.03, caught: false, word: 'Cutie 💕' },
  { id: 2, x: 75, y: 24, vx: -0.035, vy: 0.032, caught: false, word: 'Sunshine ☀️' },
  { id: 3, x: 48, y: 55, vx: 0.032, vy: -0.038, caught: false, word: 'Prettiest 🌸' },
  { id: 4, x: 26, y: 74, vx: 0.038, vy: -0.028, caught: false, word: 'Queen 👑' },
  { id: 5, x: 78, y: 68, vx: -0.04, vy: -0.03, caught: false, word: 'Favourite ❤️' },
  { id: 6, x: 55, y: 30, vx: -0.03, vy: 0.036, caught: false, word: 'Magic ✨' },
];

const HeartCatchGameStage: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const [hearts, setHearts] = useState<CatchHeart[]>(() =>
    INITIAL_HEARTS.map((h) => ({ ...h }))
  );
  const [caughtWords, setCaughtWords] = useState<string[]>([]);
  const rafRef = useRef<number | null>(null);

  const caughtCount = caughtWords.length;
  const isUnlocked = caughtCount >= 5;

  useEffect(() => {
    if (isUnlocked) return;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(40, now - last);
      last = now;

      setHearts((prev) =>
        prev.map((h) => {
          if (h.caught) return h;
          let nx = h.x + h.vx * (dt * 0.25);
          let ny = h.y + h.vy * (dt * 0.25);
          let nvx = h.vx;
          let nvy = h.vy;
          if (nx < 12 || nx > 88) nvx = -nvx;
          if (ny < 15 || ny > 85) nvy = -nvy;
          return { ...h, x: nx, y: ny, vx: nvx, vy: nvy };
        })
      );
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isUnlocked]);

  const handleCatch = (id: number, word: string) => {
    setHearts((prev) => prev.map((h) => (h.id === id ? { ...h, caught: true } : h)));
    setCaughtWords((prev) => {
      if (prev.includes(word)) return prev;
      const updated = [...prev, word];
      if (updated.length >= 5) {
        sfx.playRomanticChord();
      } else {
        sfx.playPop();
      }
      return updated;
    });
  };

  return (
    <section className="relative z-10 flex flex-col items-center justify-center px-4 py-6 max-w-xl mx-auto min-h-[80vh] w-full text-center">
      <span className="text-xs uppercase tracking-[0.25em] text-amber-300/80 mb-1">
        Page 03 · Quick Challenge
      </span>
      <h2 className="font-serif-display text-2xl sm:text-4xl text-rose-50 mb-1">
        5 Flying Hearts Pakdo, Gauri! 💘
      </h2>
      <p className="text-xs sm:text-sm text-rose-200/75 mb-4">
        Final surprise lock hai! Unlock karne ke liye 5 udte hue hearts pe tap karo ({Math.min(caughtCount, 5)}/5)
      </p>

      {/* Caught Word Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 min-h-[2.25rem] mb-3">
        {caughtWords.map((w, i) => (
          <span
            key={i}
            className="px-3 py-1 rounded-full bg-rose-500/30 border border-rose-300/40 text-xs text-amber-100 fade-in-quick"
          >
            {w}
          </span>
        ))}
      </div>

      {/* Game Arena */}
      <div className="relative w-full h-72 sm:h-80 rounded-3xl bg-gradient-to-b from-rose-950/40 via-[#140510]/80 to-rose-950/40 border border-rose-300/30 shadow-[inset_0_0_50px_rgba(225,29,72,0.2)] overflow-hidden select-none">
        {hearts.map((h) => {
          if (h.caught) return null;
          return (
            <button
              key={h.id}
              type="button"
              onClick={() => handleCatch(h.id, h.word)}
              style={{
                left: `${h.x}%`,
                top: `${h.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute w-16 h-16 rounded-full flex flex-col items-center justify-center cursor-pointer active:scale-75 transition-transform group"
              aria-label={`Catch heart ${h.word}`}
            >
              <span className="absolute inset-1 rounded-full bg-rose-500/25 blur-md group-hover:bg-amber-300/40" />
              <Heart className="relative z-10 w-9 h-9 text-rose-400 fill-rose-500 drop-shadow-[0_0_12px_rgba(244,63,94,0.9)] group-hover:scale-125 transition-transform" />
            </button>
          );
        })}

        {/* Unlocked Overlay */}
        {isUnlocked && (
          <div className="absolute inset-0 bg-rose-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center fade-in-quick z-20">
            <div className="w-14 h-14 rounded-full bg-amber-300/20 border border-amber-300/50 flex items-center justify-center mb-3">
              <Unlock className="w-7 h-7 text-amber-200" />
            </div>
            <h3 className="font-serif-display text-2xl sm:text-3xl text-amber-100 mb-2">
              Kya Baat Hai, Champion! 🎉
            </h3>
            <p className="text-xs sm:text-sm text-rose-100/80 max-w-xs mb-6">
              Tumne saare hearts chura liye (wese dil toh pehle hi chura chuki ho!). Ab chalo final card pe!
            </p>
            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold text-rose-950 bg-gradient-to-r from-amber-200 via-rose-200 to-amber-200 shadow-[0_0_30px_rgba(251,113,133,0.6)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <span>Unlock Final Card 💌</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

// ============================================================================
// STAGE 05: THE GRAND FINALE CARD + RUNAWAY "NO" BUTTON ("Smile Guaranteed!")
// ============================================================================
const NO_BUTTON_TEXTS = [
  'Nahi 😒',
  'Soch lo Gauri! 👀',
  'Galat button hai ye 🙈',
  'Pakad ke dikhao 😜',
  'No option disabled! 😂',
  'Maan bhi jao ab ❤️',
];

const GrandFinaleStage: React.FC<{
  onRestart: () => void;
  onCelebrate: () => void;
}> = ({ onRestart, onCelebrate }) => {
  const [accepted, setAccepted] = useState(false);
  const [noClicks, setNoClicks] = useState(0);
  const [noPos, setNoPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedCoupon, setSelectedCoupon] = useState<string>(
    '1x Unlimited Ice Cream & Coffee Date 🍦☕'
  );

  const handleRunawayNo = () => {
    sfx.playPop();
    setNoClicks((c) => c + 1);
    const randomX = (Math.random() - 0.5) * 170;
    const randomY = (Math.random() - 0.5) * 110;
    setNoPos({ x: randomX, y: randomY });
  };

  const handleYes = () => {
    sfx.playRomanticChord();
    setAccepted(true);
    onCelebrate();
    triggerCelebrationConfetti();
  };

  const whatsappMessage = encodeURIComponent(
    `Hey! Maine tumhara special card dekha aur accept kar liya! 💖 Claiming my VIP Pass: ${selectedCoupon}`
  );

  return (
    <section className="relative z-10 flex flex-col items-center justify-center px-4 py-8 max-w-xl mx-auto min-h-[82vh] w-full text-center">
      {!accepted ? (
        <div className="w-full rounded-3xl bg-gradient-to-b from-rose-950/75 via-[#1a0714]/90 to-rose-950/75 border border-rose-300/35 p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.65)] backdrop-blur-md">
          <div className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-300/40 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-7 h-7 text-rose-400 fill-rose-400 animate-bounce" />
          </div>

          <span className="text-xs uppercase tracking-[0.24em] text-amber-300/80 block mb-2">
            Final Secret Note For Gauri
          </span>

          <h2 className="font-serif-display text-2xl sm:text-4xl text-rose-50 leading-snug mb-4">
            Dear <span className="italic text-amber-200">Gauri</span>, tum sach mein bohot special ho! ✨
          </h2>

          <p className="text-sm sm:text-base text-rose-100/85 leading-relaxed mb-6 font-light">
            Ye chhota sa digital card sirf isliye banaya gaya taaki tumhare chehre pe wo pyari si smile aa sake. Ab ek bohot zaroori sawaal:
          </p>

          <div className="rounded-2xl bg-black/35 border border-rose-300/25 p-4 mb-7">
            <p className="font-serif-display text-xl sm:text-2xl text-amber-200">
              “Kya tum hamesha aise hi muskurati rahogi aur jaldi se ek cute si treat pe chalogi?” 🍕🍦💖
            </p>
          </div>

          {/* Yes + Runaway No Buttons */}
          <div className="relative flex flex-wrap items-center justify-center gap-4 min-h-[5.5rem]">
            <button
              type="button"
              onClick={handleYes}
              style={{
                transform: `scale(${1 + Math.min(noClicks * 0.08, 0.45)})`,
              }}
              className="z-20 inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-bold text-rose-950 bg-gradient-to-r from-amber-200 via-rose-200 to-amber-200 shadow-[0_0_30px_rgba(251,113,133,0.75)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <span>Haan Bilkul! (100% Yes) 💖</span>
            </button>

            <button
              type="button"
              onMouseEnter={handleRunawayNo}
              onClick={handleRunawayNo}
              style={{
                transform: `translate(${noPos.x}px, ${noPos.y}px)`,
                transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              className="px-5 py-3 rounded-full text-xs sm:text-sm font-medium text-rose-200 bg-rose-950/90 border border-rose-400/30 hover:bg-rose-900 cursor-pointer select-none"
            >
              {NO_BUTTON_TEXTS[noClicks % NO_BUTTON_TEXTS.length]}
            </button>
          </div>

          {noClicks > 0 && (
            <p className="text-xs text-amber-300/80 mt-2 italic">
              Haha! &ldquo;Nahi&rdquo; wala button Gauri ke liye kaam hi nahi karta 😜
            </p>
          )}
        </div>
      ) : (
        /* CELEBRATION AFTER CLICKING YES */
        <div className="w-full rounded-3xl bg-gradient-to-b from-rose-900/70 via-[#1f0818]/95 to-rose-950/80 border border-amber-300/50 p-6 sm:p-8 shadow-[0_0_60px_rgba(244,63,94,0.4)] fade-in-quick">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-300/20 border border-amber-300/40 text-amber-200 text-xs mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mission Smile: Successful!</span>
          </div>

          <h2 className="font-serif-display text-3xl sm:text-5xl text-amber-100 mb-3">
            Yayyy! Best Answer, Gauri! 🎉💖
          </h2>

          <p className="text-sm sm:text-base text-rose-100/90 max-w-md mx-auto leading-relaxed mb-6">
            Bas yahi smile toh dekhni thi! Ab apna <strong>VIP Date Coupon</strong> select karo aur screenshot leke bhej do:
          </p>

          {/* Interactive Treat / Gift Coupon Selector */}
          <div className="grid grid-cols-1 gap-2.5 text-left max-w-md mx-auto mb-6">
            {[
              '1x Unlimited Ice Cream & Coffee Date 🍦☕',
              '1x Long Drive + Your Favourite Playlist 🚗🎶',
              '1x Pizza / Momo Party (No Bill for Gauri!) 🍕🥟',
            ].map((coupon) => {
              const active = selectedCoupon === coupon;
              return (
                <button
                  key={coupon}
                  type="button"
                  onClick={() => {
                    sfx.playPop();
                    setSelectedCoupon(coupon);
                  }}
                  className={`p-3.5 rounded-2xl border text-xs sm:text-sm flex items-center justify-between transition-all cursor-pointer ${
                    active
                      ? 'bg-gradient-to-r from-rose-600/60 to-amber-600/40 border-amber-200 text-white shadow-lg'
                      : 'bg-black/30 border-rose-300/20 text-rose-200/80 hover:border-rose-300/40'
                  }`}
                >
                  <span className="font-medium">{coupon}</span>
                  {active && <CheckCircle2 className="w-4 h-4 text-amber-200 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Printable / Screenshotable VIP Pass */}
          <div className="rounded-2xl bg-gradient-to-r from-amber-100 via-rose-100 to-amber-100 text-rose-950 p-4 mb-6 shadow-xl border-2 border-dashed border-rose-400 max-w-md mx-auto">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-rose-600 mb-1">
              <span>VIP PASS · GAURI EXCLUSIVE</span>
              <span>VALID FOREVER ✨</span>
            </div>
            <p className="font-serif-display text-lg sm:text-xl font-bold text-rose-900">
              {selectedCoupon}
            </p>
            <p className="text-[11px] text-rose-700 mt-1">
              📸 Take a screenshot &amp; send it right now to claim!
            </p>
          </div>

          {/* Direct WhatsApp Action Button */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <a
              href={`https://api.whatsapp.com/send?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-semibold text-white bg-green-600 hover:bg-green-500 shadow-lg active:scale-95 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Share Claim on WhatsApp 💬</span>
            </a>
          </div>

          <button
            type="button"
            onClick={onRestart}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-medium text-rose-100 bg-white/10 hover:bg-white/20 border border-rose-300/30 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Shuru Se Phir Dekho (Replay Card)</span>
          </button>
        </div>
      )}
    </section>
  );
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================
export default function App() {
  const [stage, setStage] = useState<CardStage>(1);
  const [muted, setMuted] = useState<boolean>(false);
  const [celebration, setCelebration] = useState<boolean>(false);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      sfx.muted = next;
      if (!next) sfx.playPop();
      return next;
    });
  }, []);

  const handleRestart = () => {
    setCelebration(false);
    setStage(1);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0c040a] text-rose-50 overflow-x-hidden flex flex-col justify-between selection:bg-rose-500/30 selection:text-amber-100">
      {/* Ambient Floating Hearts & Rose-Gold Backdrop */}
      <RomanticBackground stage={stage} celebration={celebration} />

      {/* Top Navigation & Progress Header */}
      <header className="relative z-20 w-full max-w-3xl mx-auto px-5 pt-5 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-rose-200/80 font-medium">
          <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
          <span>For Gauri ✨</span>
        </div>

        {/* Step Dots */}
        <nav aria-label="Card pages" className="flex items-center gap-2">
          {([1, 2, 3, 4, 5] as CardStage[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStage(s)}
              aria-label={`Go to page ${s}`}
              className="p-1.5 cursor-pointer focus:outline-none"
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  stage === s
                    ? 'w-6 h-2 bg-amber-200 shadow-[0_0_10px_rgba(253,230,138,0.9)]'
                    : s < stage
                    ? 'w-2 h-2 bg-rose-400/70'
                    : 'w-2 h-2 bg-rose-300/25'
                }`}
              />
            </button>
          ))}
        </nav>

        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? 'Unmute sound' : 'Mute sound'}
          className="p-2 rounded-full bg-rose-950/60 border border-rose-300/25 text-rose-200 hover:text-amber-200 cursor-pointer"
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </header>

      {/* Active Card Stage */}
      <main className="flex-1 flex items-center justify-center w-full">
        {stage === 1 && <EnvelopeStage onOpen={() => setStage(2)} />}
        {stage === 2 && <FlipCardsStage onNext={() => setStage(3)} />}
        {stage === 3 && <BouquetStage onNext={() => setStage(4)} />}
        {stage === 4 && <HeartCatchGameStage onNext={() => setStage(5)} />}
        {stage === 5 && (
          <GrandFinaleStage
            onRestart={handleRestart}
            onCelebrate={() => setCelebration(true)}
          />
        )}
      </main>

      {/* Cute Footer */}
      <footer className="relative z-20 py-3 text-center text-[11px] text-rose-300/50">
        Made with extra love &amp; a little mischief for Gauri 💖
      </footer>
    </div>
  );
}
