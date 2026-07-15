"use client";

import { getAudio, getNoiseBuffer } from "./engine";

/**
 * Все звуки ритуала — чистый синтез WebAudio, 0 байт ассетов.
 * Каждый эффект строит маленький граф и сам себя убирает.
 */

/** Шкрябанье лопаты: полосовой шум, питч/громкость от силы свайпа */
export function digScrape(intensity = 0.5) {
  const a = getAudio();
  if (!a) return;
  const { ctx, sfx } = a;
  const t = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = getNoiseBuffer(ctx);
  src.playbackRate.value = 0.85 + Math.random() * 0.35;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 480 + intensity * 420 + Math.random() * 120;
  bp.Q.value = 1.1;
  const g = ctx.createGain();
  const peak = 0.1 + intensity * 0.22;
  g.gain.setValueAtTime(peak, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
  src.connect(bp).connect(g).connect(sfx);
  src.start(t);
  src.stop(t + 0.15);
}

/** Шлепок комка земли */
export function clodPlop(vol = 1) {
  const a = getAudio();
  if (!a) return;
  const { ctx, sfx } = a;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(280 + Math.random() * 60, t);
  osc.frequency.exponentialRampToValueAtTime(85, t + 0.09);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.18 * vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  osc.connect(g).connect(sfx);
  osc.start(t);
  osc.stop(t + 0.11);
}

/** Мультяшный «плюх-бойнг» приземления сосиски */
export function sausageSplat() {
  const a = getAudio();
  if (!a) return;
  const { ctx, sfx } = a;
  const t = ctx.currentTime;
  // низкий удар
  const thump = ctx.createOscillator();
  thump.type = "sine";
  thump.frequency.setValueAtTime(150, t);
  thump.frequency.exponentialRampToValueAtTime(48, t + 0.18);
  const tg = ctx.createGain();
  tg.gain.setValueAtTime(0.35, t);
  tg.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
  thump.connect(tg).connect(sfx);
  thump.start(t);
  thump.stop(t + 0.24);
  // пыльца
  const noise = ctx.createBufferSource();
  noise.buffer = getNoiseBuffer(ctx);
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 900;
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(0.16, t);
  ng.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
  noise.connect(lp).connect(ng).connect(sfx);
  noise.start(t);
  noise.stop(t + 0.18);
  // бойнг
  const boing = ctx.createOscillator();
  boing.type = "triangle";
  boing.frequency.setValueAtTime(170, t + 0.05);
  boing.frequency.exponentialRampToValueAtTime(380, t + 0.16);
  boing.frequency.exponentialRampToValueAtTime(230, t + 0.3);
  const bg = ctx.createGain();
  bg.gain.setValueAtTime(0.0001, t + 0.05);
  bg.gain.exponentialRampToValueAtTime(0.12, t + 0.09);
  bg.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
  boing.connect(bg).connect(sfx);
  boing.start(t + 0.05);
  boing.stop(t + 0.34);
}

/** Шорох сыплющейся земли (засыпка) */
export function pour() {
  const a = getAudio();
  if (!a) return;
  const { ctx, sfx } = a;
  const t = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = getNoiseBuffer(ctx);
  src.playbackRate.value = 0.9;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(1300, t);
  lp.frequency.exponentialRampToValueAtTime(380, t + 0.32);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.14, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.34);
  src.connect(lp).connect(g).connect(sfx);
  src.start(t);
  src.stop(t + 0.36);
}

/** Утаптывание: глухой топ */
export function tampThump() {
  const a = getAudio();
  if (!a) return;
  const { ctx, sfx } = a;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(95, t);
  osc.frequency.exponentialRampToValueAtTime(55, t + 0.1);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.5, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
  osc.connect(g).connect(sfx);
  osc.start(t);
  osc.stop(t + 0.15);
  const click = ctx.createBufferSource();
  click.buffer = getNoiseBuffer(ctx);
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 1800;
  const cg = ctx.createGain();
  cg.gain.setValueAtTime(0.06, t);
  cg.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
  click.connect(hp).connect(cg).connect(sfx);
  click.start(t);
  click.stop(t + 0.05);
}

/** Фанфары церемонии: арпеджио с эхом */
export function fanfare() {
  const a = getAudio();
  if (!a) return;
  const { ctx, sfx } = a;
  const t0 = ctx.currentTime + 0.05;
  const delay = ctx.createDelay(0.5);
  delay.delayTime.value = 0.22;
  const fb = ctx.createGain();
  fb.gain.value = 0.28;
  const wet = ctx.createGain();
  wet.gain.value = 0.25;
  delay.connect(fb).connect(delay);
  delay.connect(wet).connect(sfx);

  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
  notes.forEach((freq, i) => {
    const t = t0 + i * 0.17;
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.22, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + (i === 3 ? 0.7 : 0.3));
    osc.connect(g);
    g.connect(sfx);
    g.connect(delay);
    osc.start(t);
    osc.stop(t + 0.75);
  });
}

/** Лёгкий «пик» интерфейса (подхват сосиски) */
export function pick() {
  const a = getAudio();
  if (!a) return;
  const { ctx, sfx } = a;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(420, t);
  osc.frequency.exponentialRampToValueAtTime(620, t + 0.07);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.12, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
  osc.connect(g).connect(sfx);
  osc.start(t);
  osc.stop(t + 0.1);
}

/** Фоновая атмосфера: ветер (шум через LFO) + случайные птички */
export function startAmbient() {
  const a = getAudio();
  if (!a) return;
  const { ctx, amb } = a;

  // ветер
  const wind = ctx.createBufferSource();
  wind.buffer = getNoiseBuffer(ctx);
  wind.loop = true;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 300;
  const wg = ctx.createGain();
  wg.gain.value = 0.035;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.07;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.02;
  lfo.connect(lfoGain).connect(wg.gain);
  wind.connect(lp).connect(wg).connect(amb);
  wind.start();
  lfo.start();

  // птички: рекурсивный планировщик
  const chirp = () => {
    const live = getAudio();
    if (live) {
      const t = live.ctx.currentTime;
      const osc = live.ctx.createOscillator();
      osc.type = "sine";
      const base = 2300 + Math.random() * 1300;
      osc.frequency.setValueAtTime(base, t);
      osc.frequency.exponentialRampToValueAtTime(base * 1.4, t + 0.08);
      osc.frequency.exponentialRampToValueAtTime(base * 0.9, t + 0.18);
      osc.frequency.exponentialRampToValueAtTime(base * 1.3, t + 0.28);
      const g = live.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.04, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
      const pan = live.ctx.createStereoPanner();
      pan.pan.value = Math.random() * 1.6 - 0.8;
      osc.connect(g).connect(pan).connect(live.amb);
      osc.start(t);
      osc.stop(t + 0.35);
    }
    setTimeout(chirp, 3500 + Math.random() * 5500);
  };
  setTimeout(chirp, 2000);
}
