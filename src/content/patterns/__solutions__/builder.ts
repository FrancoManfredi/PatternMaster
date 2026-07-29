// Reference solution for Builder exercise
// This implements all 4 acceptance criteria

// Product — the complex object being built
export class Computer {
  constructor(
    public cpu: string = '',
    public gpu: string = '',
    public ram: string = '',
    public storage: string = '',
  ) {}
}

// Acceptance Criterion 1: Base builder with chainable methods
export class ComputerBuilder {
  protected cpu: string = '';
  protected gpu: string = '';
  protected ram: string = '';
  protected storage: string = '';

  setCPU(cpu: string): this { this.cpu = cpu; return this; }
  setGPU(gpu: string): this { this.gpu = gpu; return this; }
  setRAM(ram: string): this { this.ram = ram; return this; }
  setStorage(storage: string): this { this.storage = storage; return this; }
  build(): Computer { return new Computer(this.cpu, this.gpu, this.ram, this.storage); }
}

// Acceptance Criterion 2: Gaming builder with high-end specs
export class GamingComputerBuilder extends ComputerBuilder {
  constructor() {
    super();
    this.setCPU('Intel i9-13900K');
    this.setGPU('NVIDIA RTX 4090');
    this.setRAM('32GB DDR5');
    this.setStorage('2TB SSD NVMe');
  }
}

// Acceptance Criterion 3: Office builder with basic specs
export class OfficeComputerBuilder extends ComputerBuilder {
  constructor() {
    super();
    this.setCPU('Intel i5-13400');
    this.setGPU('Intel UHD Graphics');
    this.setRAM('8GB DDR4');
    this.setStorage('512GB SSD SATA');
  }
}

// Acceptance Criterion 4: Director with predefined recipes
export class ComputerDirector {
  static buildGamingPC(builder: ComputerBuilder): Computer {
    return builder.build();
  }
  static buildOfficePC(builder: ComputerBuilder): Computer {
    return builder.build();
  }
}
