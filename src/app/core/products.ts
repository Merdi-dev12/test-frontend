import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import type { NewProduct, Product, ProductPage } from './models';

@Service()
export class Products {
  private readonly http = inject(HttpClient);

  list(page = 1, limit = 9) {
    return this.http.get<ProductPage>('/api/products', { params: { page, limit } });
  }

  create(input: NewProduct) {
    return this.http.post<Product>('/api/products', input);
  }
}
