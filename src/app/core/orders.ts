import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import type { Order } from './models';

@Service()
export class Orders {
  private readonly http = inject(HttpClient);

  create(productId: string, quantity: number) {
    return this.http.post<Order>('/api/orders', { productId, quantity });
  }

  get(id: string) {
    return this.http.get<Order>(`/api/orders/${encodeURIComponent(id)}`);
  }
}
