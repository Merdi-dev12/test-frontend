import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Payments } from './payments';

describe('Payments API', () => {
  let payments: Payments;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    payments = TestBed.inject(Payments);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('consulte le statut sans initier une deuxième tentative', () => {
    payments.get('order-id').subscribe();
    const request = http.expectOne('/api/orders/order-id/payments');
    expect(request.request.method).toBe('GET');
    request.flush({ orderId: 'order-id', depositId: 'deposit-id', status: 'PENDING' });
  });

  it('renvoie seulement opérateur et numéro à l’initiation', () => {
    payments.initiate('order-id', {
      provider: 'VODACOM_MPESA_COD',
      phoneNumber: '243812345678',
    }).subscribe();
    const request = http.expectOne('/api/orders/order-id/payments');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      provider: 'VODACOM_MPESA_COD',
      phoneNumber: '243812345678',
    });
    request.flush({ orderId: 'order-id', depositId: 'deposit-id', status: 'PENDING', alreadyProcessed: false });
  });
});
