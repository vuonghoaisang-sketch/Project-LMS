import axios from 'axios';

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;

    if (message) {
      return message;
    }

    if (error.response?.status === 400) {
      return 'Invalid request.';
    }

    if (error.response?.status === 401) {
      return 'You are not authenticated.';
    }

    if (error.response?.status === 403) {
      return 'You do not have permission to perform this action.';
    }

    if (error.response?.status === 404) {
      return 'The requested resource was not found.';
    }

    if (error.response?.status === 409) {
      return 'This data already exists.';
    }

    if (error.response?.status && error.response.status >= 500) {
      return 'Server error. Please try again later.';
    }

    if (!error.response) {
      return 'Cannot connect to the server.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong.';
}
