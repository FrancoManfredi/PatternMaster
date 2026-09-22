import { buildGuidedExercise } from "@/lib/guided-mode/build";
import type { GuidedStepInput } from "@/lib/guided-mode/build";

const steps: GuidedStepInput[] = [
  {
    index: 0,
    title: "Definí la abstract class Device con la interfaz del dispositivo",
    explanation:
      "El patrón **Bridge** resuelve la explosión combinatoria: en lugar de M × N clases (cada dispositivo × cada control), tenés M + N. La clave es separar dos jerarquías independientes: **Abstracción** (controles remotos) e **Implementación** (dispositivos).\n\n" +
      "Todo arranca con `Device`, la interfaz de bajo nivel que todo dispositivo debe cumplir. Usamos `abstract class` en vez de `interface` porque las interfaces se borran en tiempo de compilación (Sucrase las elimina). Si usáramos `interface`, el sandbox no podría verificar `instanceof Device`.\n\n" +
      "**Los cuatro métodos que define Device**:\n" +
      "- `turnOn()` / `turnOff()` — control de encendido\n" +
      "- `setChannel(channel: number)` — selección de canal/frecuencia/track\n" +
      "- `getStatus()` — retorna un string con el estado actual\n\n" +
      "`getStatus()` es clave para el Bridge: permite que los remotos consulten el estado del dispositivo sin conocer su implementación interna. El remoto pregunta '¿estás ON?' y actúa en consecuencia.",
    code: {
      typescript:
        "abstract class Device {\n" +
        "  abstract turnOn(): void;\n" +
        "  abstract turnOff(): void;\n" +
        "  abstract setChannel(channel: number): void;\n" +
        "  abstract getStatus(): string;\n" +
        "}",
      javascript:
        "class Device {\n" +
        '  turnOn() { throw new Error("Implement turnOn()"); }\n' +
        '  turnOff() { throw new Error("Implement turnOff()"); }\n' +
        '  setChannel(ch) { throw new Error("Implement setChannel()"); }\n' +
        '  getStatus() { throw new Error("Implement getStatus()"); }\n' +
        "}",
    },
  },
  {
    index: 1,
    title: "Implementá TV, Radio y Speaker como dispositivos concretos",
    explanation:
      "Ahora implementamos los tres dispositivos. Cada uno extiende `Device` y maneja su propio estado interno:\n\n" +
      "- **TV**: canal numérico (1 por defecto), status muestra 'Canal N'\n" +
      "- **Radio**: frecuencia (88.5 por defecto), status muestra 'N MHz'\n" +
      "- **Speaker**: track (1 por defecto), status muestra 'Track N'\n\n" +
      "**Lo importante del patrón Bridge**: estos dispositivos no saben nada sobre los controles remotos. Son implementaciones puras e independientes. Un TV no tiene `remote.togglePower()` — solo expone `turnOn()`, `turnOff()`, `setChannel()` y `getStatus()`.\n\n" +
      "**Esa separación es el puente**: la abstracción (remoto) y la implementación (dispositivo) están conectadas pero no dependen una de la otra. Podés agregar un nuevo dispositivo sin tocar los remotos, o agregar un nuevo remoto sin tocar los dispositivos.",
    code: {
      typescript:
        "abstract class Device {\n" +
        "  abstract turnOn(): void;\n" +
        "  abstract turnOff(): void;\n" +
        "  abstract setChannel(channel: number): void;\n" +
        "  abstract getStatus(): string;\n" +
        "}\n" +
        "\n" +
        "class TV extends Device {\n" +
        "  private on = false;\n" +
        "  private channel = 1;\n" +
        "  turnOn() { this.on = true; }\n" +
        "  turnOff() { this.on = false; }\n" +
        "  setChannel(ch: number) { this.channel = ch; }\n" +
        "  getStatus() { return `TV ${this.on ? 'ON' : 'OFF'} - Canal ${this.channel}`; }\n" +
        "}\n" +
        "\n" +
        "class Radio extends Device {\n" +
        "  private on = false;\n" +
        "  private station = 88.5;\n" +
        "  turnOn() { this.on = true; }\n" +
        "  turnOff() { this.on = false; }\n" +
        "  setChannel(ch: number) { this.station = ch; }\n" +
        "  getStatus() { return `Radio ${this.on ? 'ON' : 'OFF'} - ${this.station}MHz`; }\n" +
        "}\n" +
        "\n" +
        "class Speaker extends Device {\n" +
        "  private on = false;\n" +
        "  private track = 1;\n" +
        "  turnOn() { this.on = true; }\n" +
        "  turnOff() { this.on = false; }\n" +
        "  setChannel(ch: number) { this.track = ch; }\n" +
        "  getStatus() { return `Speaker ${this.on ? 'ON' : 'OFF'} - Track ${this.track}`; }\n" +
        "}",
      javascript:
        "class Device {\n" +
        '  turnOn() { throw new Error("Implement turnOn()"); }\n' +
        '  turnOff() { throw new Error("Implement turnOff()"); }\n' +
        '  setChannel(ch) { throw new Error("Implement setChannel()"); }\n' +
        '  getStatus() { throw new Error("Implement getStatus()"); }\n' +
        "}\n" +
        "\n" +
        "class TV extends Device {\n" +
        "  constructor() { super(); this.on = false; this.channel = 1; }\n" +
        "  turnOn() { this.on = true; }\n" +
        "  turnOff() { this.on = false; }\n" +
        "  setChannel(ch) { this.channel = ch; }\n" +
        "  getStatus() { return `TV ${this.on ? 'ON' : 'OFF'} - Canal ${this.channel}`; }\n" +
        "}\n" +
        "\n" +
        "class Radio extends Device {\n" +
        "  constructor() { super(); this.on = false; this.station = 88.5; }\n" +
        "  turnOn() { this.on = true; }\n" +
        "  turnOff() { this.on = false; }\n" +
        "  setChannel(ch) { this.station = ch; }\n" +
        "  getStatus() { return `Radio ${this.on ? 'ON' : 'OFF'} - ${this.station}MHz`; }\n" +
        "}\n" +
        "\n" +
        "class Speaker extends Device {\n" +
        "  constructor() { super(); this.on = false; this.track = 1; }\n" +
        "  turnOn() { this.on = true; }\n" +
        "  turnOff() { this.on = false; }\n" +
        "  setChannel(ch) { this.track = ch; }\n" +
        "  getStatus() { return `Speaker ${this.on ? 'ON' : 'OFF'} - Track ${this.track}`; }\n" +
        "}",
    },
  },
  {
    index: 2,
    title: "Creá RemoteControl y BasicRemote con delegación al dispositivo",
    explanation:
      "Ahora construimos el otro lado del puente: la jerarquía de **abstracción** (controles remotos).\n\n" +
      "`RemoteControl` es una abstract class que:\n" +
      "1. Recibe un `Device` en su constructor — esa es la **referencia al implementador**\n" +
      "2. Declara `togglePower()` y `nextChannel()` como abstractos\n\n" +
      "`BasicRemote` implementa la delegación:\n" +
      "- `togglePower()`: consulta `getStatus()` al dispositivo y alterna entre ON/OFF\n" +
      "- `nextChannel()`: delega a `setChannel(2)` del dispositivo\n\n" +
      "**La magia del Bridge**: `BasicRemote` NO sabe si el dispositivo es TV, Radio o Speaker. Solo conoce la interfaz `Device`. Esto significa que un solo `BasicRemote` funciona con CUALQUIER dispositivo. Antes de Bridge, necesitabas `TVBasicRemote`, `RadioBasicRemote`, etc.",
    code: {
      typescript:
        "abstract class Device {\n" +
        "  abstract turnOn(): void;\n" +
        "  abstract turnOff(): void;\n" +
        "  abstract setChannel(channel: number): void;\n" +
        "  abstract getStatus(): string;\n" +
        "}\n" +
        "\n" +
        "class TV extends Device {\n" +
        "  private on = false;\n" +
        "  private channel = 1;\n" +
        "  turnOn() { this.on = true; }\n" +
        "  turnOff() { this.on = false; }\n" +
        "  setChannel(ch: number) { this.channel = ch; }\n" +
        "  getStatus() { return `TV ${this.on ? 'ON' : 'OFF'} - Canal ${this.channel}`; }\n" +
        "}\n" +
        "\n" +
        "class Radio extends Device {\n" +
        "  private on = false;\n" +
        "  private station = 88.5;\n" +
        "  turnOn() { this.on = true; }\n" +
        "  turnOff() { this.on = false; }\n" +
        "  setChannel(ch: number) { this.station = ch; }\n" +
        "  getStatus() { return `Radio ${this.on ? 'ON' : 'OFF'} - ${this.station}MHz`; }\n" +
        "}\n" +
        "\n" +
        "class Speaker extends Device {\n" +
        "  private on = false;\n" +
        "  private track = 1;\n" +
        "  turnOn() { this.on = true; }\n" +
        "  turnOff() { this.on = false; }\n" +
        "  setChannel(ch: number) { this.track = ch; }\n" +
        "  getStatus() { return `Speaker ${this.on ? 'ON' : 'OFF'} - Track ${this.track}`; }\n" +
        "}\n" +
        "\n" +
        "abstract class RemoteControl {\n" +
        "  constructor(protected device: Device) {}\n" +
        "  abstract togglePower(): void;\n" +
        "  abstract nextChannel(): void;\n" +
        "}\n" +
        "\n" +
        "class BasicRemote extends RemoteControl {\n" +
        "  togglePower() {\n" +
        "    const status = this.device.getStatus();\n" +
        "    if (status.includes('ON')) {\n" +
        "      this.device.turnOff();\n" +
        "    } else {\n" +
        "      this.device.turnOn();\n" +
        "    }\n" +
        "  }\n" +
        "  nextChannel() {\n" +
        "    this.device.setChannel(2);\n" +
        "  }\n" +
        "}",
      javascript:
        "class Device {\n" +
        '  turnOn() { throw new Error("Implement turnOn()"); }\n' +
        '  turnOff() { throw new Error("Implement turnOff()"); }\n' +
        '  setChannel(ch) { throw new Error("Implement setChannel()"); }\n' +
        '  getStatus() { throw new Error("Implement getStatus()"); }\n' +
        "}\n" +
        "\n" +
        "class TV extends Device {\n" +
        "  constructor() { super(); this.on = false; this.channel = 1; }\n" +
        "  turnOn() { this.on = true; }\n" +
        "  turnOff() { this.on = false; }\n" +
        "  setChannel(ch) { this.channel = ch; }\n" +
        "  getStatus() { return `TV ${this.on ? 'ON' : 'OFF'} - Canal ${this.channel}`; }\n" +
        "}\n" +
        "\n" +
        "class Radio extends Device {\n" +
        "  constructor() { super(); this.on = false; this.station = 88.5; }\n" +
        "  turnOn() { this.on = true; }\n" +
        "  turnOff() { this.on = false; }\n" +
        "  setChannel(ch) { this.station = ch; }\n" +
        "  getStatus() { return `Radio ${this.on ? 'ON' : 'OFF'} - ${this.station}MHz`; }\n" +
        "}\n" +
        "\n" +
        "class Speaker extends Device {\n" +
        "  constructor() { super(); this.on = false; this.track = 1; }\n" +
        "  turnOn() { this.on = true; }\n" +
        "  turnOff() { this.on = false; }\n" +
        "  setChannel(ch) { this.track = ch; }\n" +
        "  getStatus() { return `Speaker ${this.on ? 'ON' : 'OFF'} - Track ${this.track}`; }\n" +
        "}\n" +
        "\n" +
        "class RemoteControl {\n" +
        "  constructor(device) { this.device = device; }\n" +
        '  togglePower() { throw new Error("Implement togglePower()"); }\n' +
        '  nextChannel() { throw new Error("Implement nextChannel()"); }\n' +
        "}\n" +
        "\n" +
        "class BasicRemote extends RemoteControl {\n" +
        "  togglePower() {\n" +
        "    const status = this.device.getStatus();\n" +
        "    if (status.includes('ON')) {\n" +
        "      this.device.turnOff();\n" +
        "    } else {\n" +
        "      this.device.turnOn();\n" +
        "    }\n" +
        "  }\n" +
        "  nextChannel() {\n" +
        "    this.device.setChannel(2);\n" +
        "  }\n" +
        "}",
    },
  },
  {
    index: 3,
    title: "Agregá AdvancedRemote y verificá la mezcla polimórfica",
    explanation:
      "El paso final: `AdvancedRemote` agrega `setChannel(ch)` para seleccionar un canal específico, además de `togglePower()` y `nextChannel()` heredados de `RemoteControl`.\n\n" +
      "**La demostración clave**: creamos un `BasicRemote` con un `TV` y un `AdvancedRemote` con un `Radio`. Cada remoto controla su dispositivo delegando a la interfaz `Device`.\n\n" +
      "**Resultado del patrón Bridge**:\n" +
      "- 3 dispositivos (TV, Radio, Speaker) + 2 remotos (Basic, Advanced) = **5 clases**\n" +
      "- Sin Bridge: 3 × 2 = **6 clases** (TVBasic, TVAdvanced, RadioBasic, etc.)\n" +
      "- Con más dimensiones: 10 dispositivos × 5 remotos = 15 clases en vez de 50\n\n" +
      "**La independencia es total**: si mañana agregás un `SmartRemote`, solo creás una clase nueva que extiende `RemoteControl`. No tocás ningún dispositivo. Si agregás un `SmartTV`, solo creás una clase que extiende `Device`. No tocás ningún remoto. Eso es el Principio Abierto/Cerrado en acción.",
    code: {
      typescript:
        "abstract class Device {\n" +
        "  abstract turnOn(): void;\n" +
        "  abstract turnOff(): void;\n" +
        "  abstract setChannel(channel: number): void;\n" +
        "  abstract getStatus(): string;\n" +
        "}\n" +
        "\n" +
        "class TV extends Device {\n" +
        "  private on = false;\n" +
        "  private channel = 1;\n" +
        "  turnOn() { this.on = true; }\n" +
        "  turnOff() { this.on = false; }\n" +
        "  setChannel(ch: number) { this.channel = ch; }\n" +
        "  getStatus() { return `TV ${this.on ? 'ON' : 'OFF'} - Canal ${this.channel}`; }\n" +
        "}\n" +
        "\n" +
        "class Radio extends Device {\n" +
        "  private on = false;\n" +
        "  private station = 88.5;\n" +
        "  turnOn() { this.on = true; }\n" +
        "  turnOff() { this.on = false; }\n" +
        "  setChannel(ch: number) { this.station = ch; }\n" +
        "  getStatus() { return `Radio ${this.on ? 'ON' : 'OFF'} - ${this.station}MHz`; }\n" +
        "}\n" +
        "\n" +
        "class Speaker extends Device {\n" +
        "  private on = false;\n" +
        "  private track = 1;\n" +
        "  turnOn() { this.on = true; }\n" +
        "  turnOff() { this.on = false; }\n" +
        "  setChannel(ch: number) { this.track = ch; }\n" +
        "  getStatus() { return `Speaker ${this.on ? 'ON' : 'OFF'} - Track ${this.track}`; }\n" +
        "}\n" +
        "\n" +
        "abstract class RemoteControl {\n" +
        "  constructor(protected device: Device) {}\n" +
        "  abstract togglePower(): void;\n" +
        "  abstract nextChannel(): void;\n" +
        "}\n" +
        "\n" +
        "class BasicRemote extends RemoteControl {\n" +
        "  togglePower() {\n" +
        "    const status = this.device.getStatus();\n" +
        "    if (status.includes('ON')) {\n" +
        "      this.device.turnOff();\n" +
        "    } else {\n" +
        "      this.device.turnOn();\n" +
        "    }\n" +
        "  }\n" +
        "  nextChannel() {\n" +
        "    this.device.setChannel(2);\n" +
        "  }\n" +
        "}\n" +
        "\n" +
        "class AdvancedRemote extends RemoteControl {\n" +
        "  private channel = 1;\n" +
        "  togglePower() {\n" +
        "    const status = this.device.getStatus();\n" +
        "    if (status.includes('ON')) {\n" +
        "      this.device.turnOff();\n" +
        "    } else {\n" +
        "      this.device.turnOn();\n" +
        "    }\n" +
        "  }\n" +
        "  nextChannel() {\n" +
        "    this.channel++;\n" +
        "    this.device.setChannel(this.channel);\n" +
        "  }\n" +
        "  setChannel(ch: number) {\n" +
        "    this.channel = ch;\n" +
        "    this.device.setChannel(ch);\n" +
        "  }\n" +
        "}\n" +
        "\n" +
        "// Demo — Bridge in action: mix any remote with any device\n" +
        "const tv = new TV();\n" +
        "const basicRemote = new BasicRemote(tv);\n" +
        "basicRemote.togglePower();           // TV ON\n" +
        "basicRemote.nextChannel();           // TV canal 2\n" +
        "console.log(tv.getStatus());         // TV ON - Canal 2\n" +
        "\n" +
        "const radio = new Radio();\n" +
        "const advRemote = new AdvancedRemote(radio);\n" +
        "advRemote.togglePower();             // Radio ON\n" +
        "advRemote.setChannel(99.9);          // Radio 99.9MHz\n" +
        "console.log(radio.getStatus());      // Radio ON - 99.9MHz\n" +
        "\n" +
        "// Bridge result: 3 devices + 2 remotes = 5 classes (not 6!)",
      javascript:
        "class Device {\n" +
        '  turnOn() { throw new Error("Implement turnOn()"); }\n' +
        '  turnOff() { throw new Error("Implement turnOff()"); }\n' +
        '  setChannel(ch) { throw new Error("Implement setChannel()"); }\n' +
        '  getStatus() { throw new Error("Implement getStatus()"); }\n' +
        "}\n" +
        "\n" +
        "class TV extends Device {\n" +
        "  constructor() { super(); this.on = false; this.channel = 1; }\n" +
        "  turnOn() { this.on = true; }\n" +
        "  turnOff() { this.on = false; }\n" +
        "  setChannel(ch) { this.channel = ch; }\n" +
        "  getStatus() { return `TV ${this.on ? 'ON' : 'OFF'} - Canal ${this.channel}`; }\n" +
        "}\n" +
        "\n" +
        "class Radio extends Device {\n" +
        "  constructor() { super(); this.on = false; this.station = 88.5; }\n" +
        "  turnOn() { this.on = true; }\n" +
        "  turnOff() { this.on = false; }\n" +
        "  setChannel(ch) { this.station = ch; }\n" +
        "  getStatus() { return `Radio ${this.on ? 'ON' : 'OFF'} - ${this.station}MHz`; }\n" +
        "}\n" +
        "\n" +
        "class Speaker extends Device {\n" +
        "  constructor() { super(); this.on = false; this.track = 1; }\n" +
        "  turnOn() { this.on = true; }\n" +
        "  turnOff() { this.on = false; }\n" +
        "  setChannel(ch) { this.track = ch; }\n" +
        "  getStatus() { return `Speaker ${this.on ? 'ON' : 'OFF'} - Track ${this.track}`; }\n" +
        "}\n" +
        "\n" +
        "class RemoteControl {\n" +
        "  constructor(device) { this.device = device; }\n" +
        '  togglePower() { throw new Error("Implement togglePower()"); }\n' +
        '  nextChannel() { throw new Error("Implement nextChannel()"); }\n' +
        "}\n" +
        "\n" +
        "class BasicRemote extends RemoteControl {\n" +
        "  togglePower() {\n" +
        "    const status = this.device.getStatus();\n" +
        "    if (status.includes('ON')) { this.device.turnOff(); } else { this.device.turnOn(); }\n" +
        "  }\n" +
        "  nextChannel() { this.device.setChannel(2); }\n" +
        "}\n" +
        "\n" +
        "class AdvancedRemote extends RemoteControl {\n" +
        "  constructor(device) { super(device); this.channel = 1; }\n" +
        "  togglePower() {\n" +
        "    const status = this.device.getStatus();\n" +
        "    if (status.includes('ON')) { this.device.turnOff(); } else { this.device.turnOn(); }\n" +
        "  }\n" +
        "  nextChannel() { this.channel++; this.device.setChannel(this.channel); }\n" +
        "  setChannel(ch) { this.channel = ch; this.device.setChannel(ch); }\n" +
        "}\n" +
        "\n" +
        "// Demo\n" +
        "const tv = new TV();\n" +
        "const basicRemote = new BasicRemote(tv);\n" +
        "basicRemote.togglePower();\n" +
        "basicRemote.nextChannel();\n" +
        "console.log(tv.getStatus());\n" +
        "\n" +
        "const radio = new Radio();\n" +
        "const advRemote = new AdvancedRemote(radio);\n" +
        "advRemote.togglePower();\n" +
        "advRemote.setChannel(99.9);\n" +
        "console.log(radio.getStatus());",
    },
  },
];

export const bridgeGuided = buildGuidedExercise(
  "bridge",
  "Bridge — Modo Guiado",
  steps
);
