import { app, crashReporter } from 'electron'
import { init as initSentryMain } from '@sentry/electron/main'
import { mainProcessLogger } from '../server/logging/structured-logger'

/**
 * Crashpad + Sentry main — call once at process startup before `app.whenReady()`
 * (macOS requires crashReporter before `ready`).
 */
export function initMainTelemetry(): void {
  const minidumpUrl = process.env['SENTRY_MINIDUMP_URL'] ?? ''
  const upload = Boolean(minidumpUrl)

  try {
    if (upload) {
      crashReporter.start({
        companyName: 'Star Hotel',
        submitURL: minidumpUrl,
        uploadToServer: true,
      })
    } else {
      crashReporter.start({
        companyName: 'Star Hotel',
        uploadToServer: false,
      })
    }
    mainProcessLogger.info('crashReporter.start', { uploadToServer: upload })
  } catch (err) {
    mainProcessLogger.error('crashReporter.start failed', err)
  }

  const dsn = process.env['SENTRY_DSN']
  if (typeof dsn === 'string' && dsn.length > 0) {
    initSentryMain({
      dsn,
      release: process.env['SENTRY_RELEASE'] ?? undefined,
      environment: app.isPackaged ? 'production' : 'development',
    })
    mainProcessLogger.info('sentry.main.init', { hasDsn: true })
  } else {
    mainProcessLogger.info('sentry.main.skipped', { reason: 'SENTRY_DSN unset' })
  }
}
