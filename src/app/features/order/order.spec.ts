import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import type { Order, PaymentAttempt } from '../../core/models';
import { Orders } from '../../core/orders';
import { Payments } from '../../core/payments';
import { OrderPage } from './order';

const pendingOrder: Order = {
  id: 'order-id',
  productId: 'product-id',
  quantity: 1,
  unitPriceCdf: 5000,
  totalCdf: 5000,
  status: 'PENDING',
  createdAt: '2026-11-16T10:00:00.000Z',
  paidAt: null,
};

const pendingAttempt: PaymentAttempt = {
  orderId: 'order-id',
  depositId: 'deposit-id',
  status: 'PENDING',
};

describe('OrderPage', () => {
  it('retrouve une tentative en cours par GET sans relancer le paiement', async () => {
    const orders = { get: vi.fn(() => of(pendingOrder)) };
    const payments = {
      get: vi.fn(() => of(pendingAttempt)),
      initiate: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [OrderPage],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: 'order-id' }) } } },
        { provide: Orders, useValue: orders },
        { provide: Payments, useValue: payments },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(OrderPage);
    await fixture.whenStable();

    expect(payments.get).toHaveBeenCalledWith('order-id');
    expect(payments.initiate).not.toHaveBeenCalled();
    expect(fixture.componentInstance.order()?.status).toBe('PENDING');
    expect(fixture.componentInstance.attempt()?.status).toBe('PENDING');
  });

  it('montre la réussite seulement après le résultat final', async () => {
    const paidOrder: Order = { ...pendingOrder, status: 'PAID', paidAt: '2026-11-16T10:01:00.000Z' };
    const orders = { get: vi.fn().mockReturnValueOnce(of(pendingOrder)).mockReturnValue(of(paidOrder)) };
    const payments = {
      get: vi.fn(() => of({ ...pendingAttempt, status: 'COMPLETED' as const })),
      initiate: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [OrderPage],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: 'order-id' }) } } },
        { provide: Orders, useValue: orders },
        { provide: Payments, useValue: payments },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(OrderPage);
    await fixture.whenStable();

    expect(orders.get).toHaveBeenCalledTimes(2);
    expect(fixture.componentInstance.order()?.status).toBe('PAID');
    expect(payments.initiate).not.toHaveBeenCalled();
  });

  it('reprend les mêmes paramètres après une réponse réseau incertaine', async () => {
    const input = { provider: 'VODACOM_MPESA_COD' as const, phoneNumber: '243812345678' };
    const notFound = new HttpErrorResponse({
      status: 404,
      error: { error: { code: 'PAYMENT_NOT_FOUND', message: 'Tentative introuvable.' } },
    });
    const orders = { get: vi.fn(() => of(pendingOrder)) };
    const payments = {
      get: vi.fn(() => throwError(() => notFound)),
      initiate: vi.fn()
        .mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 0 })))
        .mockReturnValueOnce(of({ ...pendingAttempt, alreadyProcessed: true })),
    };
    await TestBed.configureTestingModule({
      imports: [OrderPage],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: 'order-id' }) } } },
        { provide: Orders, useValue: orders },
        { provide: Payments, useValue: payments },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(OrderPage);
    const page = fixture.componentInstance;
    page.initiate(input);
    fixture.detectChanges();

    expect(page.uncertainRequest()).toBe(true);
    expect((fixture.nativeElement as HTMLElement).querySelector('app-payment-form')).toBeNull();
    page.resendSame();

    expect(payments.initiate).toHaveBeenCalledTimes(2);
    expect(payments.initiate).toHaveBeenNthCalledWith(1, 'order-id', input);
    expect(payments.initiate).toHaveBeenNthCalledWith(2, 'order-id', input);
    expect(orders.get).toHaveBeenCalledTimes(1);
    fixture.destroy();
  });

  it('bloque une nouvelle initiation quand le statut initial est inaccessible', async () => {
    const orders = { get: vi.fn(() => of(pendingOrder)) };
    const payments = {
      get: vi.fn(() => throwError(() => new HttpErrorResponse({ status: 0 }))),
      initiate: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [OrderPage],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: 'order-id' }) } } },
        { provide: Orders, useValue: orders },
        { provide: Payments, useValue: payments },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(OrderPage);
    const page = fixture.componentInstance;
    fixture.detectChanges();
    expect(page.cannotVerify()).toBe(true);
    expect((fixture.nativeElement as HTMLElement).querySelector('app-payment-form')).toBeNull();

    page.initiate({ provider: 'VODACOM_MPESA_COD', phoneNumber: '243812345678' });
    expect(payments.initiate).not.toHaveBeenCalled();
    fixture.destroy();
  });

  it('ne repropose pas le paiement après un résultat fournisseur final', async () => {
    const orders = { get: vi.fn(() => of(pendingOrder)) };
    const payments = {
      get: vi.fn(() => of({ ...pendingAttempt, status: 'COMPLETED' as const })),
      initiate: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [OrderPage],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: 'order-id' }) } } },
        { provide: Orders, useValue: orders },
        { provide: Payments, useValue: payments },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(OrderPage);
    fixture.detectChanges();

    expect(fixture.componentInstance.order()?.status).toBe('PENDING');
    expect(fixture.componentInstance.attempt()?.status).toBe('COMPLETED');
    expect((fixture.nativeElement as HTMLElement).querySelector('app-payment-form')).toBeNull();
    fixture.destroy();
  });
  it('renvoie une tentative active avec la même commande et les mêmes paramètres', async () => {
    const input = { provider: 'AIRTEL_COD' as const, phoneNumber: '243812345678' };
    const notFound = new HttpErrorResponse({
      status: 404,
      error: { error: { code: 'PAYMENT_NOT_FOUND', message: 'Tentative introuvable.' } },
    });
    const orders = { get: vi.fn(() => of(pendingOrder)) };
    const payments = {
      get: vi.fn(() => throwError(() => notFound)),
      initiate: vi.fn()
        .mockReturnValueOnce(of(pendingAttempt))
        .mockReturnValueOnce(of({ ...pendingAttempt, alreadyProcessed: true })),
    };
    await TestBed.configureTestingModule({
      imports: [OrderPage],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: 'order-id' }) } } },
        { provide: Orders, useValue: orders },
        { provide: Payments, useValue: payments },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(OrderPage);
    const page = fixture.componentInstance;
    page.initiate(input);
    expect(page.isActive()).toBe(true);

    page.resendSame();
    expect(payments.initiate).toHaveBeenCalledTimes(2);
    expect(payments.initiate).toHaveBeenNthCalledWith(2, 'order-id', input);
    expect(page.notice()).toContain('existe déjà');
    fixture.destroy();
  });});
