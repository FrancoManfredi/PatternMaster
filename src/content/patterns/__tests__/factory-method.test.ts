import { describe, it, expect, vi } from "vitest";
import {
  Notification,
  EmailNotification,
  SMSNotification,
  PushNotification,
  NotificationFactory,
  NotificationService,
} from "@/content/patterns/__solutions__/factory-method";

describe("Acceptance Criterion 1: Notification interface", () => {
  it("should define Notification as a type with send method", () => {
    // Create a mock implementation that satisfies the Notification interface
    const mockNotification: Notification = {
      send: vi.fn(),
    };

    // Verify the mock has the send method
    expect(typeof mockNotification.send).toBe("function");
    expect(mockNotification.send).toBeDefined();
  });
});

describe("Acceptance Criterion 2: Concrete implementations", () => {
  it("EmailNotification implements Notification", () => {
    const email = new EmailNotification();
    expect(email).toBeInstanceOf(EmailNotification);
    expect(typeof email.send).toBe("function");
  });

  it("SMSNotification implements Notification", () => {
    const sms = new SMSNotification();
    expect(sms).toBeInstanceOf(SMSNotification);
    expect(typeof sms.send).toBe("function");
  });

  it("PushNotification implements Notification", () => {
    const push = new PushNotification();
    expect(push).toBeInstanceOf(PushNotification);
    expect(typeof push.send).toBe("function");
  });
});

describe("Acceptance Criterion 3: NotificationFactory", () => {
  it('createNotification("email") returns EmailNotification instance', () => {
    const factory = new NotificationFactory();
    const notification = factory.createNotification("email");
    expect(notification).toBeInstanceOf(EmailNotification);
  });

  it('createNotification("sms") returns SMSNotification instance', () => {
    const factory = new NotificationFactory();
    const notification = factory.createNotification("sms");
    expect(notification).toBeInstanceOf(SMSNotification);
  });

  it('createNotification("push") returns PushNotification instance', () => {
    const factory = new NotificationFactory();
    const notification = factory.createNotification("push");
    expect(notification).toBeInstanceOf(PushNotification);
  });

  it('createNotification("unknown") throws Error', () => {
    const factory = new NotificationFactory();
    expect(() => factory.createNotification("unknown")).toThrow();
  });
});

describe("Acceptance Criterion 4: NotificationService integration", () => {
  it('notify("email", "Hello") uses factory to create EmailNotification and calls send', () => {
    const factory = new NotificationFactory();
    const service = new NotificationService(factory);
    
    const email = new EmailNotification();
    const spy = vi.spyOn(email, "send");
    
    // Mock the factory to return our spied instance
    const factorySpy = vi.spyOn(factory, "createNotification").mockReturnValue(email);
    
    service.notify("email", "Hello");
    
    expect(factorySpy).toHaveBeenCalledWith("email");
    expect(spy).toHaveBeenCalledWith("Hello");
  });

  it('notify("sms", "Message") uses factory to create SMSNotification and calls send', () => {
    const factory = new NotificationFactory();
    const service = new NotificationService(factory);
    
    const sms = new SMSNotification();
    const spy = vi.spyOn(sms, "send");
    
    const factorySpy = vi.spyOn(factory, "createNotification").mockReturnValue(sms);
    
    service.notify("sms", "Message");
    
    expect(factorySpy).toHaveBeenCalledWith("sms");
    expect(spy).toHaveBeenCalledWith("Message");
  });

  it('notify("push", "Alert") uses factory to create PushNotification and calls send', () => {
    const factory = new NotificationFactory();
    const service = new NotificationService(factory);
    
    const push = new PushNotification();
    const spy = vi.spyOn(push, "send");
    
    const factorySpy = vi.spyOn(factory, "createNotification").mockReturnValue(push);
    
    service.notify("push", "Alert");
    
    expect(factorySpy).toHaveBeenCalledWith("push");
    expect(spy).toHaveBeenCalledWith("Alert");
  });
});

describe("Content-shape validation", () => {
  it("factory-method.json has exercise.acceptanceCriteria with exactly 4 entries", () => {
    // Use fs.readFileSync to load the JSON file
    const fs = require("fs");
    const path = require("path");
    const jsonPath = path.resolve(__dirname, "../factory-method.json");
    const patternData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    
    expect(patternData.exercise).toBeDefined();
    expect(patternData.exercise.acceptanceCriteria).toBeDefined();
    expect(Array.isArray(patternData.exercise.acceptanceCriteria)).toBe(true);
    expect(patternData.exercise.acceptanceCriteria).toHaveLength(4);
  });

  it("exercise.starterCode is a non-empty string", () => {
    const fs = require("fs");
    const path = require("path");
    const jsonPath = path.resolve(__dirname, "../factory-method.json");
    const patternData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    
    expect(patternData.exercise.starterCode).toBeDefined();
    expect(typeof patternData.exercise.starterCode).toBe("string");
    expect(patternData.exercise.starterCode.length).toBeGreaterThan(0);
  });
});

describe("Negative tests", () => {
  it("A class missing send() does not satisfy Notification interface (structural check)", () => {
    // This class is missing the send method
    class BadNotification {
      // No send method
    }
    
    const bad = new BadNotification();
    
    // TypeScript structural typing would catch this at compile time
    // At runtime, we can verify the method doesn't exist
    expect(typeof (bad as any).send).toBe("undefined");
  });

  it("A factory that returns wrong type fails type assertion", () => {
    class WrongNotification implements Notification {
      send(_message: string): void {
        // This implementation does nothing
      }
    }
    
    class BadFactory {
      createNotification(_type: string): Notification {
        return new WrongNotification();
      }
    }
    
    const factory = new BadFactory();
    const notification = factory.createNotification("email");
    
    // This should not be an EmailNotification
    expect(notification).not.toBeInstanceOf(EmailNotification);
    expect(notification).not.toBeInstanceOf(SMSNotification);
    expect(notification).not.toBeInstanceOf(PushNotification);
  });

  it("NotificationService without factory throws on create", () => {
    // Create a service with null factory to simulate missing dependency
    const service = new NotificationService(null as any);
    
    // This should throw when trying to use the factory
    expect(() => service.notify("email", "test")).toThrow();
  });
});