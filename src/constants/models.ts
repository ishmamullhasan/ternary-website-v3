// Canonical engagement-model names — one source of truth so the trademark mark and the display
// order never drift across pages (Stage 3.5). Canonical order is Frame → Flow → Orchestra.
// TODO(legal): confirm ™ vs ℠ for the model marks (site currently uses ™).
export const TM = '™'

export const MODEL_NAMES = ['Frame', 'Flow', 'Orchestra'] as const
export type ModelName = (typeof MODEL_NAMES)[number]

/** Model name with its trademark mark, e.g. `model('Frame')` → "Frame™". */
export const model = (name: ModelName): string => `${name}${TM}`

/** Canonical display order with marks: ["Frame™", "Flow™", "Orchestra™"]. */
export const MODELS_ORDERED: string[] = MODEL_NAMES.map(model)
