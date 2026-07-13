// Site-wide SEO defaults shared by the metadata helper, the layout defaults, and structured data.
// Keep these in one place so the title template, OG defaults, and JSON-LD never drift.

export const SITE_NAME = 'Ternary'
export const SITE_DESCRIPTION = 'Building products that shape the lives of millions every single day'

// Default Open Graph / Twitter image. Verified to exist at /public/website-template-OG.webp.
// If this file is ever removed, set to `null` and the helper will omit images gracefully.
export const DEFAULT_OG_IMAGE = '/website-template-OG.webp'
