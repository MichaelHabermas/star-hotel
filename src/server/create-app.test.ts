import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createServerApp } from './create-app'

describe('createServerApp', () => {
  it('GET /health returns ok', async () => {
    const app = createServerApp()
    const res = await request(app).get('/health').expect(200)
    expect(res.body).toEqual({ ok: true })
  })
})
