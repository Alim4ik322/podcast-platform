export class DomainError extends Error {
  constructor(
    public readonly code:
      | 'NOT_FOUND'
      | 'ALREADY_EXISTS'
      | 'CONFLICT'
      | 'INVALID_INPUT',
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export const ErrNotFound = new DomainError('NOT_FOUND', 'Resource not found');
export const ErrAlreadyExists = new DomainError(
  'ALREADY_EXISTS',
  'Resource already exists',
);
export const ErrConflict = new DomainError('CONFLICT', 'Resource conflict');
export const ErrInvalidInput = new DomainError(
  'INVALID_INPUT',
  'Invalid input data',
);