# Spec: Starter Code Consistency — Guided Mode Step 1 + Free Mode JS

## Bug A — Step 1 starterCode inconsistente con su check

**Problema**: El starterCode del Paso 1 en Modo Guiado muestra una clase Notification con `throw new Error(...)` en send(), que causa que el check `instance.send("test")` falle inmediatamente. El punto de partida del usuario debería ser un TODO sin resolver, no una implementación contradictoria.

**Fix**: 
- starterCode Step 1 TS: sin clase Notification (solo TODO comment, el usuario debe crearla)
- starterCode Step 1 JS: sin clase Notification (solo TODO, mismo contenido pero sin tipos en NotificationService)
- Crear test de verificación que ejecuta el starterCode contra el check y confirma que falla con el mensaje pedagógico correcto ("No se encontró: Notification")

## Bug B — JS starter generado dinámicamente (sin formato)

**Problema**: `generateJSStarter()` transforma el TS starter a JS en runtime, pero colapsa los saltos de línea (`.replace(/\s{2,}/g, " ")`) resultando en una línea ilegible.

**Fix**:
1. Eliminar el uso de `generateJSStarter` para mostrar el starter en el editor (solo queda como función si alguien la necesita, pero no se usa en el flujo de cambio de idioma)
2. Agregar `starterCodeJS: string` como campo estático obligatorio en el content del patrón
3. Agregar el starter JS estático a factory-method.json con saltos de línea reales
4. ExerciseSection.tsx: usar `pattern.exercise.starterCodeJS` al cambiar a JS
5. Guided content: ya tiene starterCode.javascript estático (verificar que esté correcto)
