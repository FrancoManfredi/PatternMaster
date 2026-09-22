import { describe, it, expect } from "vitest";
import {
  Device,
  TV,
  Radio,
  Speaker,
  RemoteControl,
  BasicRemote,
  AdvancedRemote,
} from "@/content/patterns/__solutions__/bridge";

describe("Acceptance Criterion 1: Device abstract class with turnOn(), turnOff(), setChannel()", () => {
  it("TV has turnOn() method", () => {
    const tv = new TV();
    expect(typeof tv.turnOn).toBe("function");
  });

  it("TV has turnOff() method", () => {
    const tv = new TV();
    expect(typeof tv.turnOff).toBe("function");
  });

  it("TV has setChannel() method", () => {
    const tv = new TV();
    expect(typeof tv.setChannel).toBe("function");
  });

  it("TV has getStatus() method", () => {
    const tv = new TV();
    expect(typeof tv.getStatus).toBe("function");
  });

  it("TV extends Device", () => {
    const tv = new TV();
    expect(tv).toBeInstanceOf(Device);
    expect(tv).toBeInstanceOf(TV);
  });

  it("Radio extends Device", () => {
    const radio = new Radio();
    expect(radio).toBeInstanceOf(Device);
    expect(radio).toBeInstanceOf(Radio);
  });

  it("Speaker extends Device", () => {
    const speaker = new Speaker();
    expect(speaker).toBeInstanceOf(Device);
    expect(speaker).toBeInstanceOf(Speaker);
  });
});

describe("Acceptance Criterion 2: TV, Radio, Speaker concrete implementations", () => {
  it("TV turnOn/turnOff toggles status", () => {
    const tv = new TV();
    expect(tv.getStatus()).toContain("OFF");
    tv.turnOn();
    expect(tv.getStatus()).toContain("ON");
    tv.turnOff();
    expect(tv.getStatus()).toContain("OFF");
  });

  it("TV setChannel updates status", () => {
    const tv = new TV();
    tv.setChannel(5);
    expect(tv.getStatus()).toContain("5");
  });

  it("Radio turnOn/turnOff toggles status", () => {
    const radio = new Radio();
    expect(radio.getStatus()).toContain("OFF");
    radio.turnOn();
    expect(radio.getStatus()).toContain("ON");
    radio.turnOff();
    expect(radio.getStatus()).toContain("OFF");
  });

  it("Radio setChannel updates frequency", () => {
    const radio = new Radio();
    radio.setChannel(101.5);
    expect(radio.getStatus()).toContain("101.5");
    expect(radio.getStatus()).toContain("MHz");
  });

  it("Speaker turnOn/turnOff toggles status", () => {
    const speaker = new Speaker();
    expect(speaker.getStatus()).toContain("OFF");
    speaker.turnOn();
    expect(speaker.getStatus()).toContain("ON");
    speaker.turnOff();
    expect(speaker.getStatus()).toContain("OFF");
  });

  it("Speaker setChannel updates track", () => {
    const speaker = new Speaker();
    speaker.setChannel(3);
    expect(speaker.getStatus()).toContain("Track");
    expect(speaker.getStatus()).toContain("3");
  });

  it("All three devices have consistent API (turnOn, turnOff, setChannel, getStatus)", () => {
    const devices: Device[] = [new TV(), new Radio(), new Speaker()];
    for (const device of devices) {
      expect(typeof device.turnOn).toBe("function");
      expect(typeof device.turnOff).toBe("function");
      expect(typeof device.setChannel).toBe("function");
      expect(typeof device.getStatus).toBe("function");
    }
  });
});

describe("Acceptance Criterion 3: RemoteControl abstraction with device reference", () => {
  it("BasicRemote extends RemoteControl", () => {
    const tv = new TV();
    const remote = new BasicRemote(tv);
    expect(remote).toBeInstanceOf(RemoteControl);
    expect(remote).toBeInstanceOf(BasicRemote);
  });

  it("BasicRemote has togglePower() method", () => {
    const remote = new BasicRemote(new TV());
    expect(typeof remote.togglePower).toBe("function");
  });

  it("BasicRemote has nextChannel() method", () => {
    const remote = new BasicRemote(new TV());
    expect(typeof remote.nextChannel).toBe("function");
  });

  it("BasicRemote.togglePower() turns device on", () => {
    const tv = new TV();
    const remote = new BasicRemote(tv);
    expect(tv.getStatus()).toContain("OFF");
    remote.togglePower();
    expect(tv.getStatus()).toContain("ON");
  });

  it("BasicRemote.togglePower() turns device off when already on", () => {
    const tv = new TV();
    tv.turnOn();
    const remote = new BasicRemote(tv);
    expect(tv.getStatus()).toContain("ON");
    remote.togglePower();
    expect(tv.getStatus()).toContain("OFF");
  });

  it("BasicRemote.nextChannel() delegates to device", () => {
    const tv = new TV();
    const remote = new BasicRemote(tv);
    tv.turnOn();
    remote.nextChannel();
    expect(tv.getStatus()).toContain("2");
  });
});

describe("Acceptance Criterion 4: BasicRemote and AdvancedRemote delegation", () => {
  it("AdvancedRemote extends RemoteControl", () => {
    const radio = new Radio();
    const remote = new AdvancedRemote(radio);
    expect(remote).toBeInstanceOf(RemoteControl);
    expect(remote).toBeInstanceOf(AdvancedRemote);
  });

  it("AdvancedRemote.togglePower() delegates to device", () => {
    const radio = new Radio();
    const remote = new AdvancedRemote(radio);
    expect(radio.getStatus()).toContain("OFF");
    remote.togglePower();
    expect(radio.getStatus()).toContain("ON");
    remote.togglePower();
    expect(radio.getStatus()).toContain("OFF");
  });

  it("AdvancedRemote.nextChannel() increments channel and delegates", () => {
    const speaker = new Speaker();
    const remote = new AdvancedRemote(speaker);
    speaker.turnOn();
    remote.nextChannel();
    expect(speaker.getStatus()).toContain("Track");
    expect(speaker.getStatus()).toContain("2");
    remote.nextChannel();
    expect(speaker.getStatus()).toContain("3");
  });

  it("AdvancedRemote.setChannel() sets specific channel on device", () => {
    const tv = new TV();
    const remote = new AdvancedRemote(tv);
    tv.turnOn();
    remote.setChannel(42);
    expect(tv.getStatus()).toContain("42");
  });

  it("Polymorphic mixing: BasicRemote works with any device", () => {
    const devices: Device[] = [new TV(), new Radio(), new Speaker()];
    for (const device of devices) {
      const remote = new BasicRemote(device);
      remote.togglePower();
      expect(device.getStatus()).toContain("ON");
    }
  });

  it("Polymorphic mixing: AdvancedRemote works with any device", () => {
    const devices: Device[] = [new TV(), new Radio(), new Speaker()];
    for (const device of devices) {
      const remote = new AdvancedRemote(device);
      remote.togglePower();
      expect(device.getStatus()).toContain("ON");
      remote.setChannel(7);
      expect(device.getStatus()).toContain("7");
    }
  });

  it("Same device can be controlled by different remotes independently", () => {
    const tv = new TV();
    const basic = new BasicRemote(tv);
    const advanced = new AdvancedRemote(tv);

    tv.turnOn();
    basic.nextChannel();
    expect(tv.getStatus()).toContain("2");

    advanced.setChannel(10);
    expect(tv.getStatus()).toContain("10");
  });
});

describe("Content-shape validation", () => {
  it("bridge.json has exercise.acceptanceCriteria with exactly 4 entries", () => {
    const fs = require("fs");
    const path = require("path");
    const jsonPath = path.resolve(__dirname, "../bridge.json");
    const patternData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

    expect(patternData.exercise).toBeDefined();
    expect(patternData.exercise.acceptanceCriteria).toBeDefined();
    expect(Array.isArray(patternData.exercise.acceptanceCriteria)).toBe(true);
    expect(patternData.exercise.acceptanceCriteria).toHaveLength(4);
  });

  it("exercise.starterCode is a non-empty string", () => {
    const fs = require("fs");
    const path = require("path");
    const jsonPath = path.resolve(__dirname, "../bridge.json");
    const patternData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

    expect(patternData.exercise.starterCode).toBeDefined();
    expect(typeof patternData.exercise.starterCode).toBe("string");
    expect(patternData.exercise.starterCode.length).toBeGreaterThan(0);
  });
});

describe("Negative tests", () => {
  it("A class missing turnOn() does not satisfy Device interface", () => {
    class BadDevice {
      turnOff() {}
      setChannel(_ch: number) {}
      getStatus() {
        return "bad";
      }
      // No turnOn() method
    }

    const bad = new BadDevice();
    expect(typeof (bad as any).turnOn).toBe("undefined");
  });

  it("A class missing setChannel() does not satisfy Device interface", () => {
    class BadDevice {
      turnOn() {}
      turnOff() {}
      getStatus() {
        return "bad";
      }
      // No setChannel() method
    }

    const bad = new BadDevice();
    expect(typeof (bad as any).setChannel).toBe("undefined");
  });

  it("A remote that does NOT delegate to device fails status change", () => {
    // Simulate a broken remote that does not delegate
    class BrokenRemote extends RemoteControl {
      togglePower() {
        // Does nothing — does NOT call device.turnOn()/turnOff()
      }
      nextChannel() {
        // Does nothing — does NOT call device.setChannel()
      }
    }

    const tv = new TV();
    const broken = new BrokenRemote(tv);

    expect(tv.getStatus()).toContain("OFF");
    broken.togglePower();
    // Device status should NOT change because remote didn't delegate
    expect(tv.getStatus()).toContain("OFF");
  });

  it("Direct device manipulation without remote works (baseline)", () => {
    // This shows that devices work independently of remotes
    const tv = new TV();
    tv.turnOn();
    expect(tv.getStatus()).toContain("ON");
    tv.setChannel(99);
    expect(tv.getStatus()).toContain("99");
  });
});
