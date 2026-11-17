import { TestBed } from '@angular/core/testing';
import { PaymentForm } from './payment-form';

describe('PaymentForm', () => {
  it('refuse un numéro invalide et émet un numéro valide', async () => {
    await TestBed.configureTestingModule({ imports: [PaymentForm] }).compileComponents();
    const fixture = TestBed.createComponent(PaymentForm);
    const component = fixture.componentInstance;
    const submitted = vi.fn();
    component.submitted.subscribe(submitted);

    component.form.controls.phoneNumber.setValue('0812345678');
    component.submit();
    expect(submitted).not.toHaveBeenCalled();

    component.form.controls.phoneNumber.setValue('243812345678');
    component.submit();
    expect(submitted).toHaveBeenCalledWith({
      provider: 'VODACOM_MPESA_COD',
      phoneNumber: '243812345678',
    });
  });
});
