// Reference solution for State exercise
// This implements all 4 acceptance criteria

// Acceptance Criterion 1: DocumentState base class
export class DocumentState {
  submitForReview(document: Document): string {
    return "Acción no disponible en este estado";
  }

  approve(document: Document): string {
    return "Acción no disponible en este estado";
  }

  reject(document: Document): string {
    return "Acción no disponible en este estado";
  }

  archive(document: Document): string {
    return "Acción no disponible en este estado";
  }
}

// Acceptance Criterion 2: DraftState
export class DraftState extends DocumentState {
  submitForReview(document: Document): string {
    document.setState(new ReviewState());
    return "Documento enviado a revisión";
  }

  approve(document: Document): string {
    return "No se puede aprobar un borrador — primero enviá a revisión";
  }

  reject(document: Document): string {
    return "No se puede rechazar un borrador — primero enviá a revisión";
  }

  archive(document: Document): string {
    document.setState(new ArchivedState());
    return "Borrador archivado";
  }
}

// Acceptance Criterion 3: ReviewState and PublishedState
export class ReviewState extends DocumentState {
  submitForReview(document: Document): string {
    return "El documento ya está en revisión";
  }

  approve(document: Document): string {
    document.setState(new PublishedState());
    return "Documento aprobado y publicado";
  }

  reject(document: Document): string {
    document.setState(new DraftState());
    return "Documento rechazado — volvió a borrador";
  }

  archive(document: Document): string {
    document.setState(new ArchivedState());
    return "Documento en revisión archivado";
  }
}

export class PublishedState extends DocumentState {
  submitForReview(document: Document): string {
    return "El documento ya está publicado";
  }

  approve(document: Document): string {
    return "El documento ya está publicado";
  }

  reject(document: Document): string {
    return "No se puede rechazar un documento publicado";
  }

  archive(document: Document): string {
    document.setState(new ArchivedState());
    return "Documento publicado archivado";
  }
}

// Helper state for the archive transition
class ArchivedState extends DocumentState {
  submitForReview(document: Document): string {
    return "No se puede hacer nada con un documento archivado";
  }

  approve(document: Document): string {
    return "No se puede hacer nada con un documento archivado";
  }

  reject(document: Document): string {
    return "No se puede hacer nada con un documento archivado";
  }

  archive(document: Document): string {
    return "El documento ya está archivado";
  }
}

// Acceptance Criterion 4: Document context that delegates to state
export class Document {
  private state: DocumentState;
  private title: string;

  constructor(title: string) {
    this.title = title;
    this.state = new DraftState();
  }

  setState(state: DocumentState): void {
    this.state = state;
  }

  getStateName(): string {
    if (this.state instanceof DraftState) return "Draft";
    if (this.state instanceof ReviewState) return "Review";
    if (this.state instanceof PublishedState) return "Published";
    if (this.state instanceof ArchivedState) return "Archived";
    return "Unknown";
  }

  submitForReview(): string {
    return this.state.submitForReview(this);
  }

  approve(): string {
    return this.state.approve(this);
  }

  reject(): string {
    return this.state.reject(this);
  }

  archive(): string {
    return this.state.archive(this);
  }
}
