// Reference solution for Command exercise
// This implements all 4 acceptance criteria

// Acceptance Criterion 1: EditorCommand base class
export class EditorCommand {
  execute(): void {
    // Base implementation — concrete subclasses override this
  }

  undo(): void {
    // Base implementation — concrete subclasses override this
  }

  redo(): void {
    // Default redo re-executes the command
    this.execute();
  }
}

// Acceptance Criterion 2: InsertCommand — inserts text at a position
export class InsertCommand extends EditorCommand {
  private text: string;
  private position: number;
  private editor: TextEditor | null = null;

  constructor(text: string, position: number) {
    super();
    this.text = text;
    this.position = position;
  }

  setEditor(editor: TextEditor): void {
    this.editor = editor;
  }

  execute(): void {
    if (this.editor) {
      const content = this.editor.getContent();
      this.editor.setContent(
        content.slice(0, this.position) + this.text + content.slice(this.position)
      );
    }
  }

  undo(): void {
    if (this.editor) {
      const content = this.editor.getContent();
      this.editor.setContent(
        content.slice(0, this.position) + content.slice(this.position + this.text.length)
      );
    }
  }
}

// Acceptance Criterion 2: DeleteCommand — deletes text at a position
export class DeleteCommand extends EditorCommand {
  private position: number;
  private length: number;
  private deletedText: string = "";
  private editor: TextEditor | null = null;

  constructor(position: number, length: number) {
    super();
    this.position = position;
    this.length = length;
  }

  setEditor(editor: TextEditor): void {
    this.editor = editor;
  }

  execute(): void {
    if (this.editor) {
      const content = this.editor.getContent();
      this.deletedText = content.slice(this.position, this.position + this.length);
      this.editor.setContent(
        content.slice(0, this.position) + content.slice(this.position + this.length)
      );
    }
  }

  undo(): void {
    if (this.editor) {
      const content = this.editor.getContent();
      this.editor.setContent(
        content.slice(0, this.position) + this.deletedText + content.slice(this.position)
      );
    }
  }
}

// Acceptance Criterion 3 & 4: TextEditor with history management
export class TextEditor {
  private content: string = "";
  private history: EditorCommand[] = [];
  private redoStack: EditorCommand[] = [];

  execute(command: EditorCommand): void {
    // Link command to this editor if it supports it
    if (typeof (command as any).setEditor === "function") {
      (command as any).setEditor(this);
    }
    command.execute();
    this.history.push(command);
    // Clear redo stack when a new command is executed
    this.redoStack = [];
  }

  undo(): void {
    const command = this.history.pop();
    if (command) {
      command.undo();
      this.redoStack.push(command);
    }
  }

  redo(): void {
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
