// Reference solution for Facade exercise
// This implements all 4 acceptance criteria

// Acceptance Criterion 1: Subsystem classes with on/off
export class Amplifier {
  private _on = false;

  on(): void {
    this._on = true;
  }

  off(): void {
    this._on = false;
  }

  isOn(): boolean {
    return this._on;
  }

  setVolume(level: number): void {
    // Set volume level
  }

  setInput(input: string): void {
    // Set input source
  }
}

export class Projector {
  private _on = false;

  on(): void {
    this._on = true;
  }

  off(): void {
    this._on = false;
  }

  isOn(): boolean {
    return this._on;
  }

  setInput(input: string): void {
    // Set input source
  }

  setWideScreen(): void {
    // Set widescreen mode
  }
}

export class Screen {
  private _down = false;

  up(): void {
    this._down = false;
  }

  down(): void {
    this._down = true;
  }

  isDown(): boolean {
    return this._down;
  }
}

export class SoundSystem {
  private _on = false;

  on(): void {
    this._on = true;
  }

  off(): void {
    this._on = false;
  }

  isOn(): boolean {
    return this._on;
  }

  setSurround(): void {
    // Enable surround sound
  }
}

// Acceptance Criterion 2, 3, 4: Facade with watchMovie() and endMovie()
export class HomeTheaterFacade {
  private amp: Amplifier;
  private projector: Projector;
  private screen: Screen;
  private sound: SoundSystem;

  constructor(
    amp?: Amplifier,
    projector?: Projector,
    screen?: Screen,
    sound?: SoundSystem
  ) {
    this.amp = amp ?? new Amplifier();
    this.projector = projector ?? new Projector();
    this.screen = screen ?? new Screen();
    this.sound = sound ?? new SoundSystem();
  }

  watchMovie(movie: string): void {
    this.screen.down();
    this.projector.on();
    this.projector.setInput("streaming");
    this.projector.setWideScreen();
    this.sound.on();
    this.sound.setSurround();
    this.amp.on();
    this.amp.setVolume(7);
    this.amp.setInput("streaming");
  }

  endMovie(): void {
    this.amp.off();
    this.sound.off();
    this.projector.off();
    this.screen.up();
  }

  getAmplifier(): Amplifier {
    return this.amp;
  }

  getProjector(): Projector {
    return this.projector;
  }

  getScreen(): Screen {
    return this.screen;
  }

  getSoundSystem(): SoundSystem {
    return this.sound;
  }
}
