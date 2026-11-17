import { Component, inject, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminAccess } from '../../core/admin-access';
import { apiErrorMessage } from '../../core/api-error';
import type { Product } from '../../core/models';
import { Products } from '../../core/products';

@Component({
  selector: 'app-create-product',
  imports: [ReactiveFormsModule],
  templateUrl: './create-product.html',
  styleUrl: './create-product.scss',
})
export class CreateProduct {
  private readonly products = inject(Products);
  private readonly admin = inject(AdminAccess);

  readonly created = output<Product>();
  readonly busy = signal(false);
  readonly error = signal('');
  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(200)] }),
    priceCdf: new FormControl<number | null>(null, [Validators.required, Validators.min(0), Validators.max(2147483647), Validators.pattern(/^\d+$/)]),
    stock: new FormControl<number | null>(null, [Validators.required, Validators.min(0), Validators.max(2147483647), Validators.pattern(/^\d+$/)]),
    adminKey: new FormControl(this.admin.key(), { nonNullable: true }),
  });

  submit(): void {
    if (this.busy()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, priceCdf, stock, adminKey } = this.form.getRawValue();
    if (priceCdf === null || stock === null) return;
    if (!name.trim()) {
      this.form.controls.name.setErrors({ required: true });
      return;
    }

    this.admin.setKey(adminKey);
    this.busy.set(true);
    this.error.set('');
    this.products.create({ name: name.trim(), priceCdf, stock }).subscribe({
      next: (product) => {
        this.busy.set(false);
        this.form.patchValue({ name: '', priceCdf: null, stock: null });
        this.created.emit(product);
      },
      error: (error: unknown) => {
        this.busy.set(false);
        this.error.set(apiErrorMessage(error));
      },
    });
  }
}

