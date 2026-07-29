// Reference solution for Factory Method exercise
// This implements all 4 acceptance criteria

// Acceptance Criterion 1: Notification base class
export class Notification {
  send(message: string): void {
    // Base implementation — concrete subclasses override this
  }
}

// Acceptance Criterion 2: Concrete implementations
export class EmailNotification extends Notification {
  private lastMessage: string = "";

  send(message: string): void {
    this.lastMessage = message;
    // In a real implementation, this would send an email
  }

  getLastMessage(): string {
    return this.lastMessage;
  }
}

export class SMSNotification extends Notification {
  private lastMessage: string = "";

  send(message: string): void {
    this.lastMessage = message;
    // In a real implementation, this would send an SMS
  }

  getLastMessage(): string {
    return this.lastMessage;
  }
}

export class PushNotification extends Notification {
  private lastMessage: string = "";

  send(message: string): void {
    this.lastMessage = message;
    // In a real implementation, this would send a push notification
  }

  getLastMessage(): string {
    return this.lastMessage;
  }
}

// Acceptance Criterion 3: NotificationFactory
export class NotificationFactory {
  createNotification(type: string): Notification {
    switch (type.toLowerCase()) {
      case "email":
        return new EmailNotification();
      case "sms":
        return new SMSNotification();
      case "push":
        return new PushNotification();
      default:
        throw new Error(`Unknown notification type: ${type}`);
    }
  }
}

// Acceptance Criterion 4: NotificationService using factory
export class NotificationService {
  private factory: NotificationFactory;

  constructor(factory: NotificationFactory) {
    this.factory = factory;
  }

  notify(type: string, message: string): void {
    const notification = this.factory.createNotification(type);
    notification.send(message);
  }
}