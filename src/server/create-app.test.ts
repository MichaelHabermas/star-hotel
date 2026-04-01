import request from 'supertest'
import { describe, expect, it } from 'vitest'
import type { PersistencePort } from './ports/persistence'
import { createServerApp } from './create-app'

describe('createServerApp', () => {
  it('GET /health returns ok', async () => {
    const app = createServerApp()
    const res = await request(app).get('/health').expect(200)
    expect(res.body).toEqual({ ok: true })
  })

  it('GET /health includes CORS for localhost Origin (browser + Vite dev)', async () => {
    const app = createServerApp()
    const res = await request(app)
      .get('/health')
      .set('Origin', 'http://localhost:5173')
      .expect(200)
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173')
    expect(res.body).toEqual({ ok: true })
  })

  it('OPTIONS /health preflight succeeds for localhost Origin', async () => {
    const app = createServerApp()
    await request(app)
      .options('/health')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'GET')
      .expect(204)
  })

  it('awaits persistence isReady before responding', async () => {
    let ready = false
    const persistence: PersistencePort = {
      async isReady() {
        ready = true
      },
      async close() {
        /* test */
      },
    }
    const app = createServerApp({ persistence })
    await request(app).get('/health').expect(200)
    expect(ready).toBe(true)
  })
})
