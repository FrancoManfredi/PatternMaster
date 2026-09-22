/**
 * Bridge — Pattern Test Definition
 *
 * Defines the test suite for the Bridge exercise in a serializable
 * format that can be sent to the sandbox Worker.
 *
 * Each criterion check is a JavaScript expression string that is evaluated
 * inside the worker context. The expression has access to:
 *   - `exports` — object with extracted named exports from user code
 *   - `assert(condition, message)` — helper that throws on failure
 *
 * IMPORTANT: These tests verify BEHAVIOR ESSENTIAL to the pattern, not
 * implementation details of __solutions__. We check:
 * - Do Device, TV, Radio, Speaker exist with the right methods?
 * - Does RemoteControl hold a device reference and delegate?
 * - Do BasicRemote and AdvancedRemote delegate to device?
 * - Can any remote work with any device (polymorphic mixing)?
 *
 * We do NOT check:
 * - Internal state variable names (on, channel, station, track)
 * - Exact getStatus() string format
 * - Whether Device is an abstract class or interface (Sucrase erases both)
 */

import type { PatternTestDef } from "../types";

export const bridgeTestDef: PatternTestDef = {
  slug: "bridge",
  expectedNamedExports: [
    "Device",
    "TV",
    "Radio",
    "Speaker",
    "RemoteControl",
    "BasicRemote",
    "AdvancedRemote",
  ],
  criteria: [
    {
      index: 0,
      label:
        "Define Device con turnOn(), turnOff(), setChannel(), getStatus() — TV, Radio, Speaker lo implementan",
      requiredExports: ["Device", "TV", "Radio", "Speaker"],
      check: `
        // Verify all three concrete devices exist and have the required methods
        var devices = [new exports.TV(), new exports.Radio(), new exports.Speaker()];
        for (var i = 0; i < devices.length; i++) {
          var d = devices[i];
          assert(d instanceof exports.Device, "Instancia " + i + " no instanceof Device");
          assert(typeof d.turnOn === 'function', "turnOn() no es función en device " + i);
          assert(typeof d.turnOff === 'function', "turnOff() no es función en device " + i);
          assert(typeof d.setChannel === 'function', "setChannel() no es función en device " + i);
          assert(typeof d.getStatus === 'function', "getStatus() no es función en device " + i);
        }
        // Verify turnOn/turnOff actually changes status
        var tv = new exports.TV();
        assert(tv.getStatus().includes('OFF'), "TV debería iniciar OFF");
        tv.turnOn();
        assert(tv.getStatus().includes('ON'), "TV debería ser ON después de turnOn()");
        tv.turnOff();
        assert(tv.getStatus().includes('OFF'), "TV debería ser OFF después de turnOff()");
        true
      `,
      failureMessage:
        "Device no tiene los métodos turnOn(), turnOff(), setChannel() o las implementaciones concretas no funcionan",
    },
    {
      index: 1,
      label:
        "RemoteControl mantiene referencia a Device — BasicRemote delega togglePower() y nextChannel()",
      requiredExports: ["RemoteControl", "BasicRemote", "TV"],
      check: `
        // BasicRemote should extend RemoteControl
        var tv = new exports.TV();
        var remote = new exports.BasicRemote(tv);
        assert(remote instanceof exports.RemoteControl, "BasicRemote no extiende RemoteControl");

        // togglePower should turn device ON
        assert(tv.getStatus().includes('OFF'), "TV debería iniciar OFF");
        remote.togglePower();
        assert(tv.getStatus().includes('ON'), "togglePower() no encendió el dispositivo");

        // togglePower again should turn device OFF
        remote.togglePower();
        assert(tv.getStatus().includes('OFF'), "togglePower() no apagó el dispositivo");

        // nextChannel should delegate to device
        tv.turnOn();
        var statusBefore = tv.getStatus();
        remote.nextChannel();
        var statusAfter = tv.getStatus();
        assert(statusBefore !== statusAfter, "nextChannel() no cambió el canal del dispositivo");
        true
      `,
      failureMessage:
        "RemoteControl o BasicRemote no delegan correctamente al dispositivo",
    },
    {
      index: 2,
      label:
        "AdvancedRemote extiende RemoteControl con setChannel() que delega al dispositivo",
      requiredExports: ["AdvancedRemote", "RemoteControl", "Radio"],
      check: `
        var radio = new exports.Radio();
        var remote = new exports.AdvancedRemote(radio);
        assert(remote instanceof exports.RemoteControl, "AdvancedRemote no extiende RemoteControl");

        // togglePower delegates
        remote.togglePower();
        assert(radio.getStatus().includes('ON'), "AdvancedRemote.togglePower() no encendió el dispositivo");

        // setChannel delegates
        assert(typeof remote.setChannel === 'function', "AdvancedRemote no tiene método setChannel()");
        remote.setChannel(101.5);
        assert(radio.getStatus().includes('101.5'), "setChannel() no delegó al dispositivo");

        // nextChannel increments
        remote.nextChannel();
        assert(radio.getStatus().includes('102'), "nextChannel() no incrementó el canal");
        true
      `,
      failureMessage:
        "AdvancedRemote no implementa setChannel() o no delega correctamente",
    },
    {
      index: 3,
      label:
        "Mezcla polimórfica: cualquier RemoteControl funciona con cualquier Device",
      requiredExports: [
        "TV",
        "Radio",
        "Speaker",
        "BasicRemote",
        "AdvancedRemote",
      ],
      check: `
        // BasicRemote should work with all device types
        var tv = new exports.TV();
        var radio = new exports.Radio();
        var speaker = new exports.Speaker();

        var basicTV = new exports.BasicRemote(tv);
        var basicRadio = new exports.BasicRemote(radio);
        var basicSpeaker = new exports.BasicRemote(speaker);

        basicTV.togglePower();
        assert(tv.getStatus().includes('ON'), "BasicRemote no funciona con TV");
        basicRadio.togglePower();
        assert(radio.getStatus().includes('ON'), "BasicRemote no funciona con Radio");
        basicSpeaker.togglePower();
        assert(speaker.getStatus().includes('ON'), "BasicRemote no funciona con Speaker");

        // AdvancedRemote should also work with all device types
        var advTV = new exports.AdvancedRemote(new exports.TV());
        var advRadio = new exports.AdvancedRemote(new exports.Radio());
        var advSpeaker = new exports.AdvancedRemote(new exports.Speaker());

        advTV.togglePower();
        advTV.setChannel(5);
        assert(advTV !== undefined, "AdvancedRemote con TV debería existir");

        advRadio.togglePower();
        advRadio.setChannel(99.9);

        advSpeaker.togglePower();
        advSpeaker.setChannel(3);

        // All devices should be ON after being toggled by different remotes
        assert(tv.getStatus().includes('ON'), "TV debería estar ON");
        assert(radio.getStatus().includes('ON'), "Radio debería estar ON");
        assert(speaker.getStatus().includes('ON'), "Speaker debería estar ON");
        true
      `,
      failureMessage:
        "No se puede mezclar cualquier remote con cualquier device — el polimorfismo de Bridge no funciona",
    },
  ],
};
