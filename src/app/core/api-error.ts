import { HttpErrorResponse } from '@angular/common/http';

interface ApiErrorBody {
  error?: { code?: string; message?: string };
}

export function apiErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Une erreur inattendue est survenue. Réessaie dans un instant.';
  }
  if (error.status === 0) {
    return 'Impossible de joindre l’API. Vérifie que le backend est démarré.';
  }
  const body = error.error as ApiErrorBody | null;
  return body?.error?.message ?? 'La demande a échoué. Réessaie dans un instant.';
}

export function apiErrorCode(error: unknown): string | undefined {
  return error instanceof HttpErrorResponse
    ? (error.error as ApiErrorBody | null)?.error?.code
    : undefined;
}
