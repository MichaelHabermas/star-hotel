import http from 'node:http'
import { createServerApp } from '../server/create-app'

/**
 * Binds the embedded API on 127.0.0.1. Call during `app.whenReady()` before creating windows
 * so the renderer can reach `/health` immediately.
 */
export function startEmbeddedApiServer(port: number): Promise<http.Server> {
  const expressApp = createServerApp()
  const server = http.createServer(expressApp)

  return new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(port, '127.0.0.1', () => {
      resolve(server)
    })
  })
}
