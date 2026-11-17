import { Component, input, output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import type { PaymentInput, PaymentProvider } from '../../core/models';
import { matchesProvider, toInternationalNumber } from './phone-number';

function providerPhoneValidator(control: AbstractControl) {
  const provider = control.get('provider')?.value as PaymentProvider | undefined;
  const phoneNumber = control.get('phoneNumber')?.value as string | undefined;
  if (!provider || !phoneNumber || !/^0\d{9}$/.test(phoneNumber)) return null;
  return matchesProvider(provider, phoneNumber) ? null : { providerMismatch: true };
}

@Component({
  selector: 'app-payment-form',
  imports: [ReactiveFormsModule],
  templateUrl: './payment-form.html',
  styleUrl: './payment-form.scss',
})
export class PaymentForm {
  readonly disabled = input(false);
  readonly submitted = output<PaymentInput>();

  readonly form = new FormGroup({
    provider: new FormControl<PaymentProvider>('VODACOM_MPESA_COD', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    phoneNumber: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^0\d{9}$/)],
    }),
  }, { validators: providerPhoneValidator });

  submit(): void {
    if (this.disabled()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { provider, phoneNumber } = this.form.getRawValue();
    this.submitted.emit({ provider, phoneNumber: toInternationalNumber(phoneNumber) });
  }
}
