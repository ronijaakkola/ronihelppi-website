// Production replacement for `dialkit`, wired in via a Vite alias in
// astro.config.mjs during `astro build`. Demos import "dialkit" unchanged; here
// the hook just returns each control's default and the root renders nothing,
// so no tuning UI or library code ships to visitors.
import type { DialConfig, DialRoot as DialRootType, ResolvedValues, useDialKit as useDialKitType } from 'dialkit';

function isTypedControl(value: unknown): value is { type: string } {
  return typeof value === 'object' && value !== null && 'type' in value;
}

export function resolveDefaults<T extends DialConfig>(config: T): ResolvedValues<T> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(config)) {
    if (Array.isArray(value)) {
      out[key] = value[0];
    } else if (isTypedControl(value)) {
      switch (value.type) {
        case 'select':
        case 'image': {
          const v = value as { default?: string; options?: (string | { value: string })[] };
          const first = v.options?.[0];
          out[key] = v.default ?? (typeof first === 'string' ? first : first?.value) ?? '';
          break;
        }
        case 'color':
        case 'text':
          out[key] = (value as { default?: string }).default ?? '';
          break;
        default:
          // spring, easing, action, pad: passed through as-is.
          out[key] = value;
      }
    } else if (typeof value === 'object' && value !== null) {
      out[key] = resolveDefaults(value as DialConfig);
    } else {
      out[key] = value;
    }
  }
  return out as ResolvedValues<T>;
}

export const useDialKit: typeof useDialKitType = (_name, config) => resolveDefaults(config);

export const DialRoot: typeof DialRootType = () => null;
