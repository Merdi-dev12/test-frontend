import type { PaymentProvider } from '../../core/models';

const prefixes: Record<PaymentProvider, readonly string[]> = {
  VODACOM_MPESA_COD: ['081', '082', '083', '086'],
  AIRTEL_COD: ['097', '098', '099'],
  ORANGE_COD: ['080', '084', '085', '089'],
};

export function matchesProvider(provider: PaymentProvider, localNumber: string): boolean {
  return /^0\d{9}$/.test(localNumber)
    && prefixes[provider].some((prefix) => localNumber.startsWith(prefix));
}

export function toInternationalNumber(localNumber: string): string {
  return '243' + localNumber.slice(1);
}
