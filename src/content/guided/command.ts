import { buildGuidedExercise } from "@/lib/guided-mode/build";
import type { GuidedStepInput } from "@/lib/guided-mode/build";

const steps: GuidedStepInput[] = [
  {
    index: 0,
    title: "El problema: editor sin deshacer/rehacer",
    explanation: `Imaginá que estás construyendo un editor de texto. Cuando el usuario escribe o borra texto, la UI llama directamente al método del editor: 'insertText()', 'deleteText()'. Esto funciona, pero tiene un problema enorme: no podés deshacer acciones. Si el usuario borra algo por error, no hay vuelta atrás.\n\n**El patrón Command** resuelve esto encapsulando cada operación como un objeto. En vez de llamar directamente al editor, creás un objeto Command que sabe cómo ejecutar Y cómo deshacer la operación. El editor mantiene un historial de comandos y puede navegar hacia adelante y hacia atrás.\n\n**En este ejercicio**: vamos a implementar un editor de texto con undo/redo usando Command. Vas a crear 'EditorCommand' (la clase base), 'InsertCommand' y 'DeleteCommand' (comandos concretos), y 'TextEditor' (el invocador con historial).`,
    code: {
      typescript: `// ❌ Sin Command — la UI llama directamente, sin undo
class TextEditor {
  insertText(text: string) {
    this.document.content += text;
  }
  deleteText(length: number) {
    this.document.content = this.document.content.slice(0, -length);
  }
}

// ✅ Con Command — cada operación es un objeto con execute/undo
// editor.execute(new InsertCommand('Hola'));
// editor.undo(); // revierte la inserción
// editor.redo(); // re-aplica la inserción`,
      javascript: `// ❌ Sin Command — la UI llama directamente, sin undo
class TextEditor {
  insertText(text) {
    this.document.content += text;
  }
  deleteText(length) {
    this.document.content = this.document.content.slice(0, -length);
  }
}

// ✅ Con Command — cada operación es un objeto con execute/undo
// editor.execute(new InsertCommand('Hola'));
// editor.undo(); // revierte la inserción
// editor.redo(); // re-aplica la inserción`,
    },
  },
  {
    index: 1,
    title: "Creá EditorCommand base e InsertCommand",
    explanation: `Primero definimos la clase base 'EditorCommand'. Esta es la abstracción que establece el contrato: todo comando debe tener 'execute()', 'undo()' y 'redo()'. La implementación base puede hacer nada (o incluso lanzar un error) — los comandos concretos van a sobrescribir estos métodos.\n\nDespués creamos 'InsertCommand', el primer comando concreto. Recibe el texto a insertar y la posición. En 'execute()' inserta el texto en el contenido del editor. En 'undo()' lo quita. 'redo()' por defecto vuelve a ejecutar.\n\n**Clave**: el comando conoce al editor (receiver) y almacena el estado necesario para deshacer. 'InsertCommand' sabe QUÉ texto insertó y DÓNDE, así puede quitarlo exactamente en 'undo()'.`,
    code: {
      typescript: `class EditorCommand {
  execute() {
    // Base — los concretos sobrescriben
  }
  undo() {
    // Base — los concretos sobrescriben
  }
  redo() {
    // Default: re-ejecuta
    this.execute();
  }
}

class InsertCommand extends EditorCommand {
  private text: string;
  private position: number;
  private editor: any = null;

  constructor(text: string, position: number) {
    super();
    this.text = text;
    this.position = position;
  }

  setEditor(editor: any) {
    this.editor = editor;
  }

  execute() {
    if (this.editor) {
      const content = this.editor.getContent();
      this.editor.setContent(
        content.slice(0, this.position) + this.text + content.slice(this.position)
      );
    }
  }

  undo() {
    if (this.editor) {
      const content = this.editor.getContent();
      this.editor.setContent(
        content.slice(0, this.position) + content.slice(this.position + this.text.length)
      );
    }
  }
}`,
      javascript: `class EditorCommand {
  execute() {
    // Base — los concretos sobrescriben
  }
  undo() {
    // Base — los concretos sobrescriben
  }
  redo() {
    // Default: re-ejecuta
    this.execute();
  }
}

class InsertCommand extends EditorCommand {
  constructor(text, position) {
    super();
    this.text = text;
    this.position = position;
    this.editor = null;
  }

  setEditor(editor) {
    this.editor = editor;
  }

  execute() {
    if (this.editor) {
      const content = this.editor.getContent();
      this.editor.setContent(
        content.slice(0, this.position) + this.text + content.slice(this.position)
      );
    }
  }

  undo() {
    if (this.editor) {
      const content = this.editor.getContent();
      this.editor.setContent(
        content.slice(0, this.position) + content.slice(this.position + this.text.length)
      );
    }
  }
}`,
    },
  },
  {
    index: 2,
    title: "Creá DeleteCommand",
    explanation: `Ahora el segundo comando concreto: 'DeleteCommand'. Este es interesante porque para deshacer un borrado, necesitás saber QUÉ texto se borró. Por eso 'DeleteCommand' guarda el texto eliminado en 'deletedText' durante 'execute()', y lo restaura en 'undo()'.\n\nRecibe la posición y la cantidad de caracteres a borrar. En 'execute()', extrae el texto que va a borrar (lo guarda en 'deletedText') y luego lo quita del contenido. En 'undo()', inserta el texto guardado de vuelta en la posición original.\n\n**Patrón importante**: cada comando almacena SU propio estado para poder deshacer. 'InsertCommand' sabe qué texto insertó. 'DeleteCommand' sabe qué texto borró. Cada comando es autónomo — no depende de que otro comando le diga qué hacer.`,
    code: {
      typescript: `class EditorCommand {
  execute() {}
  undo() {}
  redo() { this.execute(); }
}

class InsertCommand extends EditorCommand {
  private text: string;
  private position: number;
  private editor: any = null;

  constructor(text: string, position: number) {
    super();
    this.text = text;
    this.position = position;
  }

  setEditor(editor: any) { this.editor = editor; }

  execute() {
    if (this.editor) {
      const content = this.editor.getContent();
      this.editor.setContent(
        content.slice(0, this.position) + this.text + content.slice(this.position)
      );
    }
  }

  undo() {
    if (this.editor) {
      const content = this.editor.getContent();
      this.editor.setContent(
        content.slice(0, this.position) + content.slice(this.position + this.text.length)
      );
    }
  }
}

class DeleteCommand extends EditorCommand {
  private position: number;
  private length: number;
  private deletedText: string = "";
  private editor: any = null;

  constructor(position: number, length: number) {
    super();
    this.position = position;
    this.length = length;
  }

  setEditor(editor: any) { this.editor = editor; }

  execute() {
    if (this.editor) {
      const content = this.editor.getContent();
      this.deletedText = content.slice(this.position, this.position + this.length);
      this.editor.setContent(
        content.slice(0, this.position) + content.slice(this.position + this.length)
      );
    }
  }

  undo() {
    if (this.editor) {
      const content = this.editor.getContent();
      this.editor.setContent(
        content.slice(0, this.position) + this.deletedText + content.slice(this.position)
      );
    }
  }
}`,
      javascript: `class EditorCommand {
  execute() {}
  undo() {}
  redo() { this.execute(); }
}

class InsertCommand extends EditorCommand {
  constructor(text, position) {
    super();
    this.text = text;
    this.position = position;
    this.editor = null;
  }

  setEditor(editor) { this.editor = editor; }

  execute() {
    if (this.editor) {
      const content = this.editor.getContent();
      this.editor.setContent(
        content.slice(0, this.position) + this.text + content.slice(this.position)
      );
    }
  }

  undo() {
    if (this.editor) {
      const content = this.editor.getContent();
      this.editor.setContent(
        content.slice(0, this.position) + content.slice(this.position + this.text.length)
      );
    }
  }
}

class DeleteCommand extends EditorCommand {
  constructor(position, length) {
    super();
    this.position = position;
    this.length = length;
    this.deletedText = "";
    this.editor = null;
  }

  setEditor(editor) { this.editor = editor; }

  execute() {
    if (this.editor) {
      const content = this.editor.getContent();
      this.deletedText = content.slice(this.position, this.position + this.length);
      this.editor.setContent(
        content.slice(0, this.position) + content.slice(this.position + this.length)
      );
    }
  }

  undo() {
    if (this.editor) {
      const content = this.editor.getContent();
      this.editor.setContent(
        content.slice(0, this.position) + this.deletedText + content.slice(this.position)
      );
    }
  }
}`,
    },
  },
  {
    index: 3,
    title: "Creá TextEditor con historial, undo() y redo()",
    explanation: `Este es el paso que completa el patrón. 'TextEditor' es el **invocador** — el objeto que ejecuta comandos y mantiene el historial.\n\n**execute(command)**: ejecuta el comando, lo vincula al editor (si soporta 'setEditor'), lo guarda en el historial y limpia el redo stack (porque ejecutar un nuevo comando invalida el redo).\n\n**undo()**: saca el último comando del historial, llama a 'undo()' en ese comando, y lo mueve al redo stack.\n\n**redo()**: saca el último comando del redo stack, lo re-ejecuta, y lo mueve de vuelta al historial.\n\n**getContent() y setContent()**: métodos que los comandos usan para leer y modificar el contenido del editor.\n\n**El resultado final**: el editor puede ejecutar comandos, deshacer la última acción, y rehacer una acción deshecha. El historial se maneja automáticamente. Si el usuario ejecuta un comando nuevo después de un undo, el redo stack se limpia — esto es el comportamiento estándar de undo/redo.`,
    code: {
      typescript: `class EditorCommand {
  execute() {}
  undo() {}
  redo() { this.execute(); }
}

class InsertCommand extends EditorCommand {
  private text: string;
  private position: number;
  private editor: any = null;

  constructor(text: string, position: number) {
    super();
    this.text = text;
    this.position = position;
  }

  setEditor(editor: any) { this.editor = editor; }

  execute() {
    if (this.editor) {
      const content = this.editor.getContent();
      this.editor.setContent(
        content.slice(0, this.position) + this.text + content.slice(this.position)
      );
    }
  }

  undo() {
    if (this.editor) {
      const content = this.editor.getContent();
      this.editor.setContent(
        content.slice(0, this.position) + content.slice(this.position + this.text.length)
      );
    }
  }
}

class DeleteCommand extends EditorCommand {
  private position: number;
  private length: number;
  private deletedText: string = "";
  private editor: any = null;

  constructor(position: number, length: number) {
    super();
    this.position = position;
    this.length = length;
  }

  setEditor(editor: any) { this.editor = editor; }

  execute() {
    if (this.editor) {
      const content = this.editor.getContent();
      this.deletedText = content.slice(this.position, this.position + this.length);
      this.editor.setContent(
        content.slice(0, this.position) + content.slice(this.position + this.length)
      );
    }
  }

  undo() {
    if (this.editor) {
      const content = this.editor.getContent();
      this.editor.setContent(
        content.slice(0, this.position) + this.deletedText + content.slice(this.position)
      );
    }
  }
}

class TextEditor {
  private content: string = "";
  private history: EditorCommand[] = [];
  private redoStack: EditorCommand[] = [];

  execute(command: EditorCommand) {
    if (typeof (command as any).setEditor === "function") {
      (command as any).setEditor(this);
    }
    command.execute();
    this.history.push(command);
    this.redoStack = [];
  }

  undo() {
    const command = this.history.pop();
    if (command) {
      command.undo();
      this.redoStack.push(command);
    }
  }

  redo() {
    const command = this.redoStack.pop();
    if (command) {
      command.execute();
      this.history.push(command);
    }
  }

  getContent(): string {
    return this.content;
  }

  setContent(content: string): void {
    this.content = content;
  }
}

// Uso:
const editor = new TextEditor();
editor.execute(new InsertCommand("hello", 0));
editor.execute(new InsertCommand(" world", 5));
console.log(editor.getContent()); // → 'hello world'
editor.undo();
console.log(editor.getContent()); // → 'hello'
editor.redo();
console.log(editor.getContent()); // → 'hello world'`,
      javascript: `class EditorCommand {
  execute() {}
  undo() {}
  redo() { this.execute(); }
}

class InsertCommand extends EditorCommand {
  constructor(text, position) {
    super();
    this.text = text;
    this.position = position;
    this.editor = null;
  }

  setEditor(editor) { this.editor = editor; }

  execute() {
    if (this.editor) {
      const content = this.editor.getContent();
      this.editor.setContent(
        content.slice(0, this.position) + this.text + content.slice(this.position)
      );
    }
  }

  undo() {
    if (this.editor) {
      const content = this.editor.getContent();
      this.editor.setContent(
        content.slice(0, this.position) + content.slice(this.position + this.text.length)
      );
    }
  }
}

class DeleteCommand extends EditorCommand {
  constructor(position, length) {
    super();
    this.position = position;
    this.length = length;
    this.deletedText = "";
    this.editor = null;
  }

  setEditor(editor) { this.editor = editor; }

  execute() {
    if (this.editor) {
      const content = this.editor.getContent();
      this.deletedText = content.slice(this.position, this.position + this.length);
      this.editor.setContent(
        content.slice(0, this.position) + content.slice(this.position + this.length)
      );
    }
  }

  undo() {
    if (this.editor) {
      const content = this.editor.getContent();
      this.editor.setContent(
        content.slice(0, this.position) + this.deletedText + content.slice(this.position)
      );
    }
  }
}

class TextEditor {
  constructor() {
    this.content = "";
    this.history = [];
    this.redoStack = [];
  }

  execute(command) {
    if (typeof command.setEditor === "function") {
      command.setEditor(this);
    }
    command.execute();
    this.history.push(command);
    this.redoStack = [];
  }

  undo() {
    const command = this.history.pop();
    if (command) {
      command.undo();
      this.redoStack.push(command);
    }
  }

  redo() {
    const command = this.redoStack.pop();
    if (command) {
      command.execute();
      this.history.push(command);
    }
  }

  getContent() {
    return this.content;
  }

  setContent(content) {
    this.content = content;
  }
}

// Uso:
const editor = new TextEditor();
editor.execute(new InsertCommand("hello", 0));
editor.execute(new InsertCommand(" world", 5));
console.log(editor.getContent()); // → 'hello world'
editor.undo();
console.log(editor.getContent()); // → 'hello'
editor.redo();
console.log(editor.getContent()); // → 'hello world'`,
    },
  },
];

export const commandGuided = buildGuidedExercise(
  "command",
  "Command — Modo Guiado",
  steps
);
