import { DevErrorTestPage } from '@renderer/pages/dev-error-test-page';
import type { ComponentType } from 'react';

/** True when Vite dev routes (error boundaries, etc.) are registered. */
export const isDevRoutesEnabled = import.meta.env.DEV;

export type DevRouteDefinition = {
  readonly path: string;
  readonly label: string;
  readonly Page: ComponentType;
};

export const devRouteDefinitions: readonly DevRouteDefinition[] = [
  { path: '/dev/error-test', label: 'Dev error test', Page: DevErrorTestPage },
];
