// src/utils/errors.ts

/**
 * Extracts a user-friendly error message from any error shape thrown by axios or the backend.
 */
export function getErrorMessage(err: unknown, fallback = 'Algo deu errado. Tente novamente.'): string {
  if (!err || typeof err !== 'object') return fallback;

  const e = err as Record<string, any>;

  // --- Axios network error (no response) ---
  if (e.code === 'ECONNABORTED') {
    return 'O servidor demorou para responder. Verifique sua conexão.';
  }
  if (e.code === 'ERR_NETWORK' || e.message?.includes('Network Error')) {
    return 'Não foi possível conectar ao servidor. O backend está rodando?';
  }

  // --- Axios response with backend error body ---
  const data = e.response?.data;
  if (data) {
    // Our ApiResponse<T> structure: { status, error, message, path, data? }
    if (typeof data === 'object') {
      // Validation errors come as { message: "Validation failed", data: { field: "message" } }
      if (data.error === 'VALIDATION_ERROR' && data.data && typeof data.data === 'object') {
        const fieldErrors = Object.entries(data.data)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join('\n');
        return fieldErrors || data.message || fallback;
      }

      // Other structured errors
      if (data.message && typeof data.message === 'string') {
        return data.message;
      }
      if (data.error && typeof data.error === 'string') {
        return data.error;
      }
    }
  }

  // --- HTTP status fallbacks ---
  const status = e.response?.status;
  if (status === 401) return 'Sessão expirada. Faça login novamente.';
  if (status === 403) return 'Você não tem permissão para esta ação.';
  if (status === 404) return 'Recurso não encontrado.';
  if (status === 409) return 'Conflito. O recurso já existe ou foi modificado.';
  if (status && status >= 500) return 'Erro interno do servidor. Tente novamente mais tarde.';

  // --- Last resort ---
  if (e.message && typeof e.message === 'string') {
    return e.message;
  }

  return fallback;
}

/**
 * Returns true if the error is a network/timeout error (not a business-logic error).
 */
export function isNetworkError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as Record<string, any>;
  return !!(e.code === 'ECONNABORTED' || e.code === 'ERR_NETWORK' || e.message?.includes('Network Error'));
}
