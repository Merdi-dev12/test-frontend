import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { apiErrorMessage } from '../../core/api-error';
import type { Product } from '../../core/models';
import { Orders } from '../../core/orders';
import { Products } from '../../core/products';
import { CreateProduct } from './create-product';
import { ProductCard } from './product-card';

@Component({
  imports: [CreateProduct, ProductCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly productsApi = inject(Products);
  private readonly ordersApi = inject(Orders);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly items = signal<Product[]>([]);
  readonly page = signal(1);
  readonly totalPages = signal(0);
  readonly total = signal(0);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly notice = signal('');
  readonly orderingId = signal<string | null>(null);

  constructor() {
    this.load(1);
  }

  load(page: number): void {
    this.loading.set(true);
    this.error.set('');
    this.productsApi.list(page, 6).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (result) => {
        this.items.set(result.items);
        this.page.set(result.page);
        this.totalPages.set(result.totalPages);
        this.total.set(result.total);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.error.set(apiErrorMessage(error));
        this.loading.set(false);
      },
    });
  }

  select(event: { product: Product; quantity: number }): void {
    if (this.orderingId()) return;
    this.orderingId.set(event.product.id);
    this.error.set('');
    this.ordersApi.create(event.product.id, event.quantity)
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (order) => void this.router.navigate(['/orders', order.id], { state: { productName: event.product.name } }),
        error: (error: unknown) => {
          this.orderingId.set(null);
          this.error.set(apiErrorMessage(error));
        },
      });
  }

  onCreated(product: Product): void {
    this.notice.set(`${product.name} a été ajouté au catalogue.`);
    this.load(1);
  }
}
