import { matchesProvider, toInternationalNumber } from './phone-number';

describe('numéros Mobile Money RDC', () => {
  it.each([
    ['VODACOM_MPESA_COD', '081', '082', '083', '086'],
    ['AIRTEL_COD', '097', '098', '099'],
    ['ORANGE_COD', '080', '084', '085', '089'],
  ] as const)('accepte les préfixes de %s', (provider, ...prefixes) => {
    for (const prefix of prefixes) {
      expect(matchesProvider(provider, prefix + '3456789')).toBe(true);
    }
  });

  it('refuse un opérateur différent et un numéro incomplet', () => {
    expect(matchesProvider('ORANGE_COD', '0833456789')).toBe(false);
    expect(matchesProvider('AIRTEL_COD', '097345678')).toBe(false);
    expect(matchesProvider('AIRTEL_COD', '0963456789')).toBe(false);
  });

  it('remplace le zéro initial par 243', () => {
    expect(toInternationalNumber('0813456789')).toBe('243813456789');
  });
});
