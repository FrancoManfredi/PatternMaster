// Reference solution for Singleton exercise
// This implements all 4 acceptance criteria

// Acceptance Criterion 1: Private constructor
export class ConfigManager {
  private static instance: ConfigManager;
  private config: Record<string, string>;

  private constructor() {
    this.config = {
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      API_KEY: 'secret-123',
    };
  }

  // Acceptance Criterion 2: Static getInstance
  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  // Acceptance Criterion 3: get(key)
  get(key: string): string | undefined {
    return this.config[key];
  }

  // Acceptance Criterion 4: getAll
  getAll(): Record<string, string> {
    return { ...this.config };
  }
}