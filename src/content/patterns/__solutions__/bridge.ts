// Reference solution for Bridge exercise
// This implements all 4 acceptance criteria

// Acceptance Criterion 1: Device abstract class with turnOn(), turnOff(), setChannel(), getStatus()
// Using abstract class (not interface) because Sucrase strips interfaces at runtime,
// which would break instanceof checks in the sandbox Worker.
export abstract class Device {
  abstract turnOn(): void;
  abstract turnOff(): void;
  abstract setChannel(channel: number): void;
  abstract getStatus(): string;
}

// Acceptance Criterion 2: TV, Radio, Speaker as concrete device implementations

export class TV extends Device {
  private on = false;
  private channel = 1;

  turnOn() {
    this.on = true;
  }

  turnOff() {
    this.on = false;
  }

  setChannel(ch: number) {
    this.channel = ch;
  }

  getStatus() {
    return `TV ${this.on ? "ON" : "OFF"} - Canal ${this.channel}`;
  }
}

export class Radio extends Device {
  private on = false;
  private station = 88.5;

  turnOn() {
    this.on = true;
  }

  turnOff() {
    this.on = false;
  }

  setChannel(ch: number) {
    this.station = ch;
  }

  getStatus() {
    return `Radio ${this.on ? "ON" : "OFF"} - ${this.station}MHz`;
  }
}

export class Speaker extends Device {
  private on = false;
  private track = 1;

  turnOn() {
    this.on = true;
  }

  turnOff() {
    this.on = false;
  }

  setChannel(ch: number) {
    this.track = ch;
  }

  getStatus() {
    return `Speaker ${this.on ? "ON" : "OFF"} - Track ${this.track}`;
  }
}

// Acceptance Criterion 3: RemoteControl abstraction that holds a Device reference
export abstract class RemoteControl {
  constructor(protected device: Device) {}

  abstract togglePower(): void;
  abstract nextChannel(): void;
}

// Acceptance Criterion 4: BasicRemote and AdvancedRemote that delegate to device
export class BasicRemote extends RemoteControl {
  togglePower() {
    const status = this.device.getStatus();
    if (status.includes("ON")) {
      this.device.turnOff();
    } else {
      this.device.turnOn();
    }
  }

  nextChannel() {
    this.device.setChannel(2);
  }
}

export class AdvancedRemote extends RemoteControl {
  private channel = 1;

  togglePower() {
    const status = this.device.getStatus();
    if (status.includes("ON")) {
      this.device.turnOff();
    } else {
      this.device.turnOn();
    }
  }

  nextChannel() {
    this.channel++;
    this.device.setChannel(this.channel);
  }

  setChannel(ch: number) {
    this.channel = ch;
    this.device.setChannel(ch);
  }
}
