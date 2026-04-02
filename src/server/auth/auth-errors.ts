export class AuthInvalidCredentialsError extends Error {
  readonly httpStatus = 401 as const;
  readonly errorCode = 'AUTH_INVALID_CREDENTIALS' as const;

  constructor(message = 'Invalid username or password') {
    super(message);
    this.name = 'AuthInvalidCredentialsError';
  }
}
