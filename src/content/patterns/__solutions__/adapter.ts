// Reference solution for Adapter exercise
// This implements all 4 acceptance criteria

// Mock external services with incompatible APIs
export class StripeAPI {
  charge(params: { amount_in_cents: number; currency_code: string }): { id: string; status: string } {
    return { id: 'ch_' + Math.random().toString(36).slice(2), status: 'succeeded' };
  }
}

export class PayPalAPI {
  processPayment(value: number, coin: string): { confirmation: string; state: string } {
    return { confirmation: 'PP-' + Math.random().toString(36).slice(2), state: 'completed' };
  }
}

// Acceptance Criterion 1: Target class with pay() and refund()
export class PaymentProvider {
  pay(amount: number): { id: string; status: string } {
    return { id: '', status: '' };
  }

  refund(transactionId: string): boolean {
    return false;
  }
}

// Acceptance Criterion 2: StripeAdapter translates charge() to pay()
export class StripeAdapter extends PaymentProvider {
  private stripe: StripeAPI;

  constructor(stripe: StripeAPI) {
    super();
    this.stripe = stripe;
  }

  pay(amount: number): { id: string; status: string } {
    return this.stripe.charge({ amount_in_cents: amount * 100, currency_code: 'usd' });
  }

  refund(transactionId: string): boolean {
    return true;
  }
}

// Acceptance Criterion 3: PayPalAdapter translates processPayment() to pay()
export class PayPalAdapter extends PaymentProvider {
  private paypal: PayPalAPI;

  constructor(paypal: PayPalAPI) {
    super();
    this.paypal = paypal;
  }

  pay(amount: number): { id: string; status: string } {
    const result = this.paypal.processPayment(amount, 'USD');
    return { id: result.confirmation, status: result.state };
  }

  refund(transactionId: string): boolean {
    return true;
  }
}

// Acceptance Criterion 4: checkout() accepts any PaymentProvider
export function checkout(provider: PaymentProvider, amount: number): { id: string; status: string } {
  return provider.pay(amount);
}
