import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import type { PaymentAttempt, PaymentInput } from './models';

@Service()
export class Payments {
  private readonly http = inject(HttpClient);

  initiate(orderId: string, input: PaymentInput) {
    return this.http.post<PaymentAttempt>(
      `/api/orders/${encodeURIComponent(orderId)}/payments`,
      input,
    );
  }

  get(orderId: string) {
    return this.http.get<PaymentAttempt>(
      `/api/orders/${encodeURIComponent(orderId)}/payments`,
    );
  }
}
