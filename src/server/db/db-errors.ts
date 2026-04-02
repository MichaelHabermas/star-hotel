/**
 * Structured errors for SQLite constraint failures (API layer maps these to HTTP 4xx).
 * better-sqlite3 throws with `code` like `SQLITE_CONSTRAINT_FOREIGNKEY`.
 */

export type DbConstraintKind = 'FOREIGN_KEY' | 'UNIQUE' | 'CHECK' | 'NOT_NULL' | 'UNKNOWN'

export class DbConstraintError extends Error {
  readonly kind: DbConstraintKind
  readonly sqliteCode: string | undefined
  readonly httpStatus = 400 as const
  readonly errorCode = 'DB_CONSTRAINT' as const

  constructor(
    message: string,
    kind: DbConstraintKind,
    sqliteCode: string | undefined,
    cause?: unknown,
  ) {
    super(message)
    this.name = 'DbConstraintError'
    this.kind = kind
    this.sqliteCode = sqliteCode
    if (cause !== undefined) {
      ;(this as Error & { cause?: unknown }).cause = cause
    }
  }

  get details(): unknown {
    return { kind: this.kind }
  }
}

function kindFromSqliteConstraintCode(code: string): DbConstraintKind {
  if (code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
    return 'FOREIGN_KEY'
  }
  if (code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return 'UNIQUE'
  }
  if (code === 'SQLITE_CONSTRAINT_CHECK') {
    return 'CHECK'
  }
  if (code === 'SQLITE_CONSTRAINT_NOTNULL') {
    return 'NOT_NULL'
  }
  if (code.startsWith('SQLITE_CONSTRAINT')) {
    return 'UNKNOWN'
  }
  return 'UNKNOWN'
}

/**
 * Maps a thrown better-sqlite3 / SQLite error to {@link DbConstraintError} when the failure
 * is constraint-related; otherwise rethrows the original value.
 */
export function mapSqliteConstraintError(err: unknown): DbConstraintError {
  if (err instanceof DbConstraintError) {
    return err
  }
  if (err !== null && typeof err === 'object' && 'code' in err) {
    const code = String((err as { code?: unknown }).code)
    if (code.startsWith('SQLITE_CONSTRAINT')) {
      const message =
        'message' in err && typeof (err as { message?: unknown }).message === 'string'
          ? (err as { message: string }).message
          : 'SQLite constraint failed'
      return new DbConstraintError(message, kindFromSqliteConstraintCode(code), code, err)
    }
  }
  throw err
}
