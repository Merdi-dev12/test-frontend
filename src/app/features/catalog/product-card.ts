import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
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
  readonly initial = computed(() => this.product().name.trim().charAt(0).toUpperCase() || 'Z');
}
