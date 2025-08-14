// SoundManager singleton handles sound effects and mute state
// Supports: piece move sound, game end sound, mute toggle with persistence

export class SoundManager {
  private static instance: SoundManager;
  private moveAudio: HTMLAudioElement;
  private endAudio: HTMLAudioElement;
  private muted: boolean = false;
  private readonly STORAGE_KEY = 'chess9000_mute';

  private constructor() {
    this.moveAudio = new Audio('piecemoved.mp3');
    this.endAudio = new Audio('gameending.mp3');
    this.moveAudio.preload = 'auto';
    this.endAudio.preload = 'auto';
    this.restoreMuteSetting();
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  private restoreMuteSetting() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored !== null) {
        this.muted = stored === 'true';
      }
    } catch (e) {
      // ignore storage errors
    }
  }

  private persistMuteSetting() {
    try {
      localStorage.setItem(this.STORAGE_KEY, this.muted ? 'true' : 'false');
    } catch (e) {
      // ignore
    }
  }

  public setMuted(m: boolean) {
    this.muted = m;
    this.persistMuteSetting();
  }

  public toggleMuted(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  private safePlay(audio: HTMLAudioElement) {
    if (this.muted) return;
    try {
      audio.currentTime = 0;
      void audio.play();
    } catch (e) {
      // ignore play errors (autoplay restrictions)
    }
  }

  public playMove() {
    this.safePlay(this.moveAudio);
  }

  public playGameEnd() {
    this.safePlay(this.endAudio);
  }
}
