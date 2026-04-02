import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { starHotelOpenApiDocument } from '../src/server/openapi/openapi-spec'

const __dirname = dirname(fileURLToPath(import.meta.url))
const out = join(__dirname, '../src/server/openapi/openapi-spec.json')
writeFileSync(out, `${JSON.stringify(starHotelOpenApiDocument, null, 2)}\n`)
