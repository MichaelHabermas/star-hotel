import type { JSX } from 'react'

export function DevErrorTestPage(): JSX.Element {
  throw new Error('Dev error boundary test — intentional throw')
}
