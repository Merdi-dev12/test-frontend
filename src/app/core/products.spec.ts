import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Products } from './products';

describe('Products API', () => {
  let products: Products;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    products = TestBed.inject(Products);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('demande la bonne page du catalogue', () => {
    products.list(2, 6).subscribe();
    const request = http.expectOne((req) =>
      req.url === '/api/products' && req.params.get('page') === '2' && req.params.get('limit') === '6',
    );
    expect(request.request.method).toBe('GET');
    request.flush({ items: [], page: 2, limit: 6, total: 0, totalPages: 0 });
  });

  it('crée un produit sans clé', () => {
    products.create({ name: 'Savon', priceCdf: 5000, stock: 10 }).subscribe();
    const request = http.expectOne('/api/products');
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.has('x-admin-key')).toBe(false);
    expect(request.request.body).toEqual({ name: 'Savon', priceCdf: 5000, stock: 10 });
    request.flush({ id: 'product-id', name: 'Savon', priceCdf: 5000, stock: 10, createdAt: new Date().toISOString() });
  });
});
