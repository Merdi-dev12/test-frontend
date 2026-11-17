import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription, timer } from 'rxjs';
import { apiErrorCode, apiErrorMessage } from '../../core/api-error';
import type { Order, PaymentAttempt, PaymentInput } from '../../core/models';
import { Orders } from '../../core/orders';
import { Payments } from '../../core/payments';
import { PaymentForm } from './payment-form';

@Component({
  imports: [CurrencyPipe, DatePipe, RouterLink, PaymentForm],
  templateUrl: './order.html',
  styleUrl: './order.scss',
})
export class OrderPage {
  private readonly route = inject(ActivatedRoute);
  private readonly orders = inject(Orders);
  private readonly payments = inject(Payments);
  private readonly destroyRef = inject(DestroyRef);
  private polling?: Subscription;

  readonly id = this.route.snapshot.paramMap.get('id') ?? '';
  readonly productName = signal((history.state?.productName as string | undefined) ?? '');
  readonly order = signal<Order | null>(null);
  readonly attempt = signal<PaymentAttempt | null>(null);
  readonly paymentInput = signal<PaymentInput | null>(null);
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly checking = signal(false);
  readonly uncertainRequest = signal(false);
  readonly cannotVerify = signal(false);
  readonly error = signal('');
  readonly notice = signal('');
  readonly isActive = computed(() => {
    const status = this.attempt()?.status;
    return status === 'INITIATING' || status === 'PENDING' || status === 'UNKNOWN';
  });

  constructor() {
    this.loadOrder();
    this.destroyRef.onDestroy(() => this.stopPolling());
  }

  loadOrder(checkPayment = true): void {
    this.orders.get(this.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (order) => {
        this.order.set(order);
        this.loading.set(false);
        if (order.status === 'PAID') this.stopPolling();
        else if (checkPayment) this.refreshPayment(true);
      },
      error: (error: unknown) => {
        this.error.set(apiErrorMessage(error));
        this.loading.set(false);
      },
    });
  }

  initiate(input: PaymentInput, retrySame = false): void {
    if (this.busy() || this.checking() || this.attempt()?.status === 'COMPLETED') return;
    if (!retrySame && (this.isActive() || this.uncertainRequest() || this.cannotVerify())) return;
    this.paymentInput.set(input);
    this.busy.set(true);
    this.error.set('');
    this.notice.set('');
    this.payments.initiate(this.id, input).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (attempt) => {
        this.busy.set(false);
        this.uncertainRequest.set(false);
        this.cannotVerify.set(false);
        this.attempt.set(attempt);
        this.notice.set(attempt.status === 'FAILED'
          ? 'La tentative a échoué. Vérifie les paramètres et réessaie.'
          : attempt.alreadyProcessed
            ? 'Cette tentative existe déjà. Aucune nouvelle demande n’a été créée.'
            : 'Demande envoyée. Nous attendons le résultat final de la sandbox.');
        if (attempt.status === 'COMPLETED') this.loadOrder(false);
        else if (attempt.status !== 'FAILED') this.startPolling();
      },
      error: (error: unknown) => {
        this.busy.set(false);
        const code = apiErrorCode(error);
        if (code === 'ORDER_ALREADY_PAID') {
          this.notice.set('Commande déjà payée : aucune nouvelle demande envoyée.');
          this.loadOrder(false);
        } else if (code === 'PAYMENT_IN_PROGRESS') {
          this.error.set(apiErrorMessage(error));
          this.refreshPayment();
        } else if (code === 'INVALID_PAYMENT' || code === 'INSUFFICIENT_STOCK'
          || code === 'ORDER_NOT_FOUND' || code === 'PROVIDER_NOT_CONFIGURED') {
          this.error.set(apiErrorMessage(error));
        } else {
          this.uncertainRequest.set(true);
          this.notice.set('La réponse du paiement est incertaine. Vérifie le statut avant toute nouvelle demande.');
          this.refreshPayment(true);
        }
      },
    });
  }

  resendSame(): void {
    const input = this.paymentInput();
    if (input && !this.busy() && !this.checking()) {
      this.initiate(input, true);
    }
  }

  refreshPayment(ignoreMissing = false): void {
    if (this.checking()) return;
    this.checking.set(true);
    this.error.set('');
    this.payments.get(this.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (attempt) => {
        this.checking.set(false);
        this.uncertainRequest.set(false);
        this.cannotVerify.set(false);
        this.attempt.set(attempt);
        if (attempt.status === 'COMPLETED') {
          this.stopPolling();
          this.loadOrder(false);
        } else if (attempt.status === 'FAILED') {
          this.stopPolling();
          this.notice.set('La tentative a échoué. Tu peux réessayer.');
        } else {
          this.startPolling();
        }
      },
      error: (error: unknown) => {
        this.checking.set(false);
        if (apiErrorCode(error) === 'PAYMENT_NOT_FOUND' && !this.uncertainRequest() && !this.attempt()) {
          this.cannotVerify.set(false);
          if (!ignoreMissing) this.notice.set('Aucune tentative de paiement trouvée.');
          return;
        }
        if (this.uncertainRequest()) {
          this.notice.set('Statut non confirmé. Réessaie avec les mêmes paramètres ou vérifie à nouveau.');
          this.startPolling();
        } else {
          this.cannotVerify.set(true);
          this.error.set(apiErrorMessage(error));
          this.startPolling();
        }
      },
    });
  }

  statusLabel(): string {
    switch (this.attempt()?.status) {
      case 'COMPLETED': return 'Paiement confirmé';
      case 'FAILED': return 'Paiement échoué';
      case 'UNKNOWN': return 'Vérification en cours';
      case 'INITIATING':
      case 'PENDING': return 'En attente de confirmation';
      default: return this.uncertainRequest() ? 'Réponse incertaine'
        : this.cannotVerify() ? 'Statut indisponible' : 'Aucun paiement initié';
    }
  }

  private startPolling(): void {
    if (this.polling) return;
    this.polling = timer(5000, 5000).subscribe(() => this.refreshPayment());
  }

  private stopPolling(): void {
    this.polling?.unsubscribe();
    this.polling = undefined;
  }
}
