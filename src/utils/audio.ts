/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Safe browser audio synthesizer for cute actions
export function playPopSound() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Bubble pop sound (quick rising pitch)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.12);
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    console.warn("Audio Context could not start", e);
  }
}

export function playTadaSound() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    const now = ctx.currentTime;
    // Chime notes: C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      
      gain.gain.setValueAtTime(0.15, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.4);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.45);
    });
  } catch (e) {
    console.warn("Audio Context could not start", e);
  }
}

export function playSuccessSound() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    // Quick success arpeggio
    const freqs = [392.00, 523.25, 659.25, 783.99]; // G4, C5, E5, G5
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      
      gain.gain.setValueAtTime(0.12, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.35);
    });
  } catch (e) {
    console.warn("Audio Context failed", e);
  }
}

// Beautiful synthesized applause/clapping sound for overall completion
export function playApplauseSound() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // Simulate multiple clapping sounds overlapping using white noise bandpass bursts
    const numClaps = 28; // 28 individual clap pulses
    for (let c = 0; c < numClaps; c++) {
      // each clap starts at a staggered random offset
      const clapStart = now + (c * 0.075) + (Math.random() * 0.05);
      const clapDuration = 0.10 + Math.random() * 0.08;

      // Noise source
      const noiseNode = ctx.createBufferSource();
      const nodeBuffer = ctx.createBuffer(1, ctx.sampleRate * clapDuration, ctx.sampleRate);
      const data = nodeBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        // High-frequency white noise
        data[i] = Math.random() * 2 - 1;
      }
      noiseNode.buffer = nodeBuffer;

      // Bandpass filter centered around 1400Hz (fleshy clap sound)
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1400 + Math.random() * 500;
      filter.Q.value = 2.5;

      // Gain Envelope (sudden attack, quick decay)
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, clapStart);
      gainNode.gain.linearRampToValueAtTime(0.18 + Math.random() * 0.1, clapStart + 0.005);
      gainNode.gain.exponentialRampToValueAtTime(0.001, clapStart + clapDuration - 0.01);

      // Connect nodes
      noiseNode.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Start and Stop
      noiseNode.start(clapStart);
      noiseNode.stop(clapStart + clapDuration);
    }

    // Also play a happy C-Major chord celebration ringing on top of the clapping!
    const chord = [261.63, 329.63, 392.00, 523.25, 659.25]; // C4, E4, G4, C5, E5
    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);
      
      gain.gain.setValueAtTime(0.10, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 1.2);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 1.25);
    });

  } catch (e) {
    console.warn("Audio Context applause synthesis failed", e);
  }
}

