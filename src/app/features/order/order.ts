import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { apiErrorMessage } from '../../core/api-error';
import type { Order } from '../../core/models';
import { Orders } from '../../core/orders';

@Component({
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './order.html',
  styleUrl: './order.scss',
})
export class OrderPage {
  private readonly route = inject(ActivatedRoute);
  private readonly orders = inject(Orders);
  private readonly destroyRef = inject(DestroyRef);

  readonly id = this.route.snapshot.paramMap.get('id') ?? '';
  readonly productName = signal((history.state?.productName as string | undefined) ?? '');
  readonly order = signal<Order | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.error.set('');
    this.orders.get(this.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (order) => {
        this.order.set(order);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.error.set(apiErrorMessage(error));
        this.loading.set(false);
      },
    });
  }
}
