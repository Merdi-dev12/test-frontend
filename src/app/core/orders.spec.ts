import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Orders } from './orders';

describe('Orders API', () => {
  it('crée une commande avec le produit et la quantité choisis', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const orders = TestBed.inject(Orders);
    const http = TestBed.inject(HttpTestingController);

    orders.create('product-1', 2).subscribe();
    const request = http.expectOne('/api/orders');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ productId: 'product-1', quantity: 2 });
    request.flush({
      id: 'order-1', productId: 'product-1', quantity: 2, unitPriceCdf: 5000,
      totalCdf: 10000, status: 'PENDING', createdAt: '2026-11-16T00:00:00Z', paidAt: null,
    });
    http.verify();
  });

  it('lit une commande par son identifiant', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const orders = TestBed.inject(Orders);
    const http = TestBed.inject(HttpTestingController);

    orders.get('order-1').subscribe();
    const request = http.expectOne('/api/orders/order-1');
    expect(request.request.method).toBe('GET');
    request.flush({
      id: 'order-1', productId: 'product-1', quantity: 2, unitPriceCdf: 5000,
      totalCdf: 10000, status: 'PENDING', createdAt: '2026-11-16T00:00:00Z', paidAt: null,
    });
    http.verify();
  });
});
