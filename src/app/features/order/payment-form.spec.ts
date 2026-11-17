import { TestBed } from '@angular/core/testing';
import { PaymentForm } from './payment-form';

describe('PaymentForm', () => {
  it.each([
    ['VODACOM_MPESA_COD', '0813456789', '243813456789'],
    ['AIRTEL_COD', '0973456789', '243973456789'],
    ['ORANGE_COD', '0893456789', '243893456789'],
  ] as const)('convertit le numéro local pour %s', async (provider, local, international) => {
    await TestBed.configureTestingModule({ imports: [PaymentForm] }).compileComponents();
    const component = TestBed.createComponent(PaymentForm).componentInstance;
    const submitted = vi.fn();
    component.submitted.subscribe(submitted);

    component.form.setValue({ provider, phoneNumber: local });
    component.submit();
    expect(submitted).toHaveBeenCalledWith({ provider, phoneNumber: international });
  });

  it('refuse un préfixe incohérent même après un changement d’opérateur', async () => {
    await TestBed.configureTestingModule({ imports: [PaymentForm] }).compileComponents();
    const component = TestBed.createComponent(PaymentForm).componentInstance;
    const submitted = vi.fn();
    component.submitted.subscribe(submitted);

    component.form.controls.phoneNumber.setValue('0833456789');
    component.form.controls.provider.setValue('ORANGE_COD');
    component.submit();
    expect(component.form.hasError('providerMismatch')).toBe(true);
    expect(submitted).not.toHaveBeenCalled();

    component.form.controls.phoneNumber.setValue('243813456789');
    component.submit();
    expect(submitted).not.toHaveBeenCalled();
  });
});
