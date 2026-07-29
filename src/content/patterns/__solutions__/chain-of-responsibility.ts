// Reference solution for Chain of Responsibility exercise
// This implements all 4 acceptance criteria

// Acceptance Criterion 1: ApprovalHandler base class with setNext() and approve()
export class ApprovalHandler {
  private next: ApprovalHandler | null = null;

  setNext(handler: ApprovalHandler): ApprovalHandler {
    this.next = handler;
    return handler;
  }

  approve(amount: number): string {
    if (this.next) {
      return this.next.approve(amount);
    }
    return 'Nadie pudo aprobar el gasto';
  }
}

// Acceptance Criterion 2: EmployeeHandler (limit $100)
export class EmployeeHandler extends ApprovalHandler {
  approve(amount: number): string {
    if (amount <= 100) {
      return 'Employee aprobó el gasto de $' + amount;
    }
    return super.approve(amount);
  }
}

// Acceptance Criterion 3: ManagerHandler (limit $1000)
export class ManagerHandler extends ApprovalHandler {
  approve(amount: number): string {
    if (amount <= 1000) {
      return 'Manager aprobó el gasto de $' + amount;
    }
    return super.approve(amount);
  }
}

// Acceptance Criterion 4: DirectorHandler (approves any amount)
export class DirectorHandler extends ApprovalHandler {
  approve(amount: number): string {
    return 'Director aprobó el gasto de $' + amount;
  }
}
