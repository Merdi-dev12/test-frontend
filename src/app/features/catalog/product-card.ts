import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import type { Product } from '../../core/models';

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  readonly product = input.required<Product>();
  readonly tone = input(0);
  readonly selected = output<{ product: Product; quantity: number }>();

  readonly quantity = signal(1);
  readonly initial = computed(() => this.product().name.trim().charAt(0).toUpperCase() || 'Z');

  decrease(): void {
    this.quantity.update((value) => Math.max(1, value - 1));
  }

  increase(): void {
    this.quantity.update((value) => Math.min(this.product().stock, value + 1));
  }

  choose(): void {
    if (this.product().stock < 1 || this.quantity() > this.product().stock) return;
    this.selected.emit({ product: this.product(), quantity: this.quantity() });
  }
}
