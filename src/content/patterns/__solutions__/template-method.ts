// Reference solution for Template Method exercise
// This implements all 5 acceptance criteria

// Acceptance Criterion 1: ReportGenerator base class with template method
export class ReportGenerator {
  generate(): string {
    const data = this.getData();
    const processed = this.processData(data);
    const formatted = this.formatOutput(processed);
    return this.exportReport(formatted);
  }

  protected getData(): string[] {
    return ['item1', 'item2', 'item3'];
  }

  protected processData(data: string[]): string[] {
    return data;
  }

  protected formatOutput(data: string[]): string {
    return data.join('\n');
  }

  protected exportReport(formatted: string): string {
    return formatted;
  }
}

// Acceptance Criterion 2: Steps are defined in base class, overridable by subclasses
// (getData, processData, formatOutput, exportReport are all protected methods in ReportGenerator)

// Acceptance Criterion 3: PDFReport
export class PDFReport extends ReportGenerator {
  protected processData(data: string[]): string[] {
    return data.map(d => d.toUpperCase());
  }

  protected formatOutput(data: string[]): string {
    return '[PDF] ' + data.join(' | ');
  }

  protected exportReport(formatted: string): string {
    return 'PDF exported: ' + formatted;
  }
}

// Acceptance Criterion 4: HTMLReport
export class HTMLReport extends ReportGenerator {
  protected processData(data: string[]): string[] {
    return data.map(d => '<li>' + d + '</li>');
  }

  protected formatOutput(data: string[]): string {
    return '<ul>' + data.join('') + '</ul>';
  }

  protected exportReport(formatted: string): string {
    return 'HTML exported: ' + formatted;
  }
}

// Acceptance Criterion 4: CSVReport
export class CSVReport extends ReportGenerator {
  protected processData(data: string[]): string[] {
    return data;
  }

  protected formatOutput(data: string[]): string {
    return 'name\n' + data.join('\n');
  }

  protected exportReport(formatted: string): string {
    return 'CSV exported: ' + formatted;
  }
}
