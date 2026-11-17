import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { AdminAccess } from './admin-access';
import type { NewProduct, Product, ProductPage } from './models';

@Service()
export class Products {
  private readonly http = inject(HttpClient);
  private readonly admin = inject(AdminAccess);

  list(page = 1, limit = 9) {
    return this.http.get<ProductPage>('/api/products', { params: { page, limit } });
  }

  create(input: NewProduct) {
    const key = this.admin.key();
    return this.http.post<Product>('/api/products', input, {
      headers: key ? { 'x-admin-key': key } : {},
    });
  }
}
