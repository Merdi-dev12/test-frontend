import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Home } from './home';

describe('Catalogue', () => {
  it('affiche les produits et charge la page suivante', async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: Router, useValue: { navigate: () => Promise.resolve(true) } }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Home);
    const http = TestBed.inject(HttpTestingController);
    http.expectOne((request) =>
      request.url === '/api/products' && request.params.get('page') === '1',
    ).flush({
      items: [{ id: 'p1', name: 'Savon', priceCdf: 5000, stock: 10, createdAt: '2026-11-16T00:00:00Z' }],
      page: 1, limit: 6, total: 7, totalPages: 2,
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Savon');
    const next = [...(fixture.nativeElement as HTMLElement).querySelectorAll('button')]
      .find((button) => button.textContent?.includes('Suivant'));
    expect(next).toBeTruthy();
    next!.click();

    http.expectOne((request) =>
      request.url === '/api/products' && request.params.get('page') === '2',
    ).flush({
      items: [{ id: 'p2', name: 'Riz', priceCdf: 12000, stock: 3, createdAt: '2026-11-16T00:00:00Z' }],
      page: 2, limit: 6, total: 7, totalPages: 2,
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Riz');
    expect(fixture.nativeElement.textContent).not.toContain('Savon');
    http.verify();
  });

  it('crée une seule commande après un double clic', async () => {
    const navigations: unknown[][] = [];
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: { navigate: (...args: unknown[]) => {
          navigations.push(args);
          return Promise.resolve(true);
        } } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Home);
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/products?page=1&limit=6').flush({
      items: [{ id: 'p1', name: 'Savon', priceCdf: 5000, stock: 10, createdAt: '2026-11-16T00:00:00Z' }],
      page: 1, limit: 6, total: 1, totalPages: 1,
    });
    fixture.detectChanges();

    const button = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.card-action');
    expect(button).toBeTruthy();
    button!.click();
    button!.click();

    const request = http.expectOne('/api/orders');
    expect(request.request.body).toEqual({ productId: 'p1', quantity: 1 });
    request.flush({
      id: 'o1', productId: 'p1', quantity: 1, unitPriceCdf: 5000,
      totalCdf: 5000, status: 'PENDING', createdAt: '2026-11-16T00:00:00Z', paidAt: null,
    });
    expect(navigations).toEqual([[['/orders', 'o1'], { state: { productName: 'Savon' } }]]);
    http.verify();
  });});
