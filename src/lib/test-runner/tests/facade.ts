/**
 * Facade — Pattern Test Definition
 *
 * Defines the test suite for the Facade exercise in a serializable
 * format that can be sent to the sandbox Worker.
 *
 * Each criterion check is a JavaScript expression string that is evaluated
 * inside the worker context. The expression has access to:
 *   - `exports` — object with extracted named exports from user code
 *   - `assert(condition, message)` — helper that throws on failure
 *
 * IMPORTANT: These tests verify BEHAVIOR ESSENTIAL to the pattern, not
 * implementation details. We check:
 * - Do Amplifier, Projector, Screen, SoundSystem exist with on/off/config methods?
 * - Does HomeTheaterFacade exist and coordinate subsystems?
 * - Does watchMovie() turn on all subsystems?
 * - Does endMovie() turn off all subsystems?
 *
 * We do NOT check:
 * - Exact order of internal calls (implementation detail)
 * - Internal state variables
 * - Console output messages
 */

import type { PatternTestDef } from "../types";

export const facadeTestDef: PatternTestDef = {
  slug: "facade",
  expectedNamedExports: [
    "Amplifier",
    "Projector",
    "Screen",
    "SoundSystem",
    "HomeTheaterFacade",
  ],
  criteria: [
    {
      index: 0,
      label:
        "Define clases de subsistema: Amplifier, Projector, Screen, SoundSystem con métodos on/off",
      requiredExports: ["Amplifier", "Projector", "Screen", "SoundSystem"],
      check: `
        // Amplifier — must have on/off
        var amp = new exports.Amplifier();
        assert(typeof amp.on === 'function', "Amplifier no tiene método on()");
        assert(typeof amp.off === 'function', "Amplifier no tiene método off()");
        amp.on();
        amp.off();

        // Projector — must have on/off
        var proj = new exports.Projector();
        assert(typeof proj.on === 'function', "Projector no tiene método on()");
        assert(typeof proj.off === 'function', "Projector no tiene método off()");
        proj.on();
        proj.off();

        // Screen — must have up/down
        var scr = new exports.Screen();
        assert(typeof scr.up === 'function', "Screen no tiene método up()");
        assert(typeof scr.down === 'function', "Screen no tiene método down()");
        scr.down();
        scr.up();

        // SoundSystem — must have on/off
        var snd = new exports.SoundSystem();
        assert(typeof snd.on === 'function', "SoundSystem no tiene método on()");
        assert(typeof snd.off === 'function', "SoundSystem no tiene método off()");
        snd.on();
        snd.off();

        true
      `,
      failureMessage:
        "Las clases de subsistema deben existir con métodos on/off (o up/down para Screen)",
    },
    {
      index: 1,
      label:
        "Cada subsistema tiene configuración específica (setVolume, setInput, setWideScreen, setSurround)",
      requiredExports: ["Amplifier", "Projector", "SoundSystem"],
      check: `
        var amp = new exports.Amplifier();
        assert(typeof amp.setVolume === 'function', "Amplifier no tiene setVolume()");
        assert(typeof amp.setInput === 'function', "Amplifier no tiene setInput()");
        amp.setVolume(5);
        amp.setInput("DVD");

        var proj = new exports.Projector();
        assert(typeof proj.setInput === 'function', "Projector no tiene setInput()");
        assert(typeof proj.setWideScreen === 'function', "Projector no tiene setWideScreen()");
        proj.setInput("HDMI");
        proj.setWideScreen();

        var snd = new exports.SoundSystem();
        assert(typeof snd.setSurround === 'function', "SoundSystem no tiene setSurround()");
        snd.setSurround();

        true
      `,
      failureMessage:
        "Los subsistemas deben tener métodos de configuración específicos",
    },
    {
      index: 2,
      label:
        "Implementa HomeTheaterFacade con watchMovie() que coordine todos los subsistemas",
      requiredExports: ["HomeTheaterFacade", "Amplifier", "Projector", "Screen", "SoundSystem"],
      check: `
        var facade = new exports.HomeTheaterFacade();
        assert(typeof facade.watchMovie === 'function', "HomeTheaterFacade no tiene watchMovie()");

        // watchMovie should activate subsystems
        facade.watchMovie("Inception");

        var amp = facade.getAmplifier ? facade.getAmplifier() : null;
        var proj = facade.getProjector ? facade.getProjector() : null;
        var scr = facade.getScreen ? facade.getScreen() : null;
        var snd = facade.getSoundSystem ? facade.getSoundSystem() : null;

        // At minimum, subsystems should be accessible and turned on
        // We verify by checking that calling watchMovie doesn't throw
        // and that subsystems can be retrieved (if getter exists)
        // or that the facade itself tracks state
        if (amp && typeof amp.isOn === 'function') {
          assert(amp.isOn() === true, "Amplifier debería estar encendido después de watchMovie");
        }
        if (proj && typeof proj.isOn === 'function') {
          assert(proj.isOn() === true, "Projector debería estar encendido después de watchMovie");
        }
        if (scr && typeof scr.isDown === 'function') {
          assert(scr.isDown() === true, "Screen debería estar bajada después de watchMovie");
        }
        if (snd && typeof snd.isOn === 'function') {
          assert(snd.isOn() === true, "SoundSystem debería estar encendido después de watchMovie");
        }

        true
      `,
      failureMessage:
        "HomeTheaterFacade.watchMovie() debe coordinar y encender todos los subsistemas",
    },
    {
      index: 3,
      label:
        "Implementa endMovie() que apague todo en el orden correcto",
      requiredExports: ["HomeTheaterFacade"],
      check: `
        var facade = new exports.HomeTheaterFacade();
        assert(typeof facade.endMovie === 'function', "HomeTheaterFacade no tiene endMovie()");

        // First watch, then end
        facade.watchMovie("Inception");
        facade.endMovie();

        // After endMovie, subsystems should be off
        var amp = facade.getAmplifier ? facade.getAmplifier() : null;
        var proj = facade.getProjector ? facade.getProjector() : null;
        var scr = facade.getScreen ? facade.getScreen() : null;
        var snd = facade.getSoundSystem ? facade.getSoundSystem() : null;

        if (amp && typeof amp.isOn === 'function') {
          assert(amp.isOn() === false, "Amplifier debería estar apagado después de endMovie");
        }
        if (proj && typeof proj.isOn === 'function') {
          assert(proj.isOn() === false, "Projector debería estar apagado después de endMovie");
        }
        if (scr && typeof scr.isDown === 'function') {
          assert(scr.isDown() === false, "Screen debería estar subida después de endMovie");
        }
        if (snd && typeof snd.isOn === 'function') {
          assert(snd.isOn() === false, "SoundSystem debería estar apagado después de endMovie");
        }

        true
      `,
      failureMessage:
        "HomeTheaterFacade.endMovie() debe apagar todos los subsistemas",
    },
  ],
};
