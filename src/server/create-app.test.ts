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
