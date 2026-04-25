export function getErrorMessage(error: unknown, fallback = 'حدث خطأ غير متوقع.') {
  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    const maybeMessage = 'message' in error ? error.message : null;
    if (typeof maybeMessage === 'string' && maybeMessage.trim()) {
      return maybeMessage;
    }

    const maybeResponse = 'response' in error ? error.response : null;
    if (typeof maybeResponse === 'object' && maybeResponse !== null && 'data' in maybeResponse) {
      const maybeData = maybeResponse.data;
      if (typeof maybeData === 'object' && maybeData !== null && 'message' in maybeData) {
        const responseMessage = maybeData.message;
        if (typeof responseMessage === 'string' && responseMessage.trim()) {
          return responseMessage;
        }
      }
    }
  }

  return fallback;
}
