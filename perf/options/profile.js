// Resolve options based on PROFILE env. Default: smoke.
//
// Usage in scenario:
//   import { resolveOptions } from '../options/profile.js';
//   export const options = resolveOptions();

import { options as smoke } from './smoke.js';
import { options as load } from './load.js';
import { options as stress } from './stress.js';

const PROFILES = { smoke, load, stress };

export function resolveOptions() {
  const name = (__ENV.PROFILE || 'smoke').toLowerCase();
  const opts = PROFILES[name];
  if (!opts) {
    throw new Error(`unknown PROFILE='${name}'. valid: ${Object.keys(PROFILES).join(', ')}`);
  }
  return opts;
}
