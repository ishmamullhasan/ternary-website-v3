import { revalidateTag } from 'next/cache'
import { APIError, type CollectionConfig, slugField } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { AboutApproach } from '@/blocks/AboutApproach/config'
import { AboutBeliefs } from '@/blocks/AboutBeliefs/config'
import { AboutFundingStory } from '@/blocks/AboutFundingStory/config'
import { AboutHero } from '@/blocks/AboutHero/config'
import { AboutIntro } from '@/blocks/AboutIntro/config'
import { AboutLeadership } from '@/blocks/AboutLeadership/config'
import { AboutProofOfScale } from '@/blocks/AboutProofOfScale/config'
import { AboutThesis } from '@/blocks/AboutThesis/config'
import { CapabilityLedger } from '@/blocks/CapabilityLedger/config'
import { CareersGridOne } from '@/blocks/CareersGridOne/config'
import { CareersGridTwo } from '@/blocks/CareersGridTwo/config'
import { CareersGrowth } from '@/blocks/CareersGrowth/config'
import { CareersHero } from '@/blocks/CareersHero/config'
import { CareersTeam } from '@/blocks/CareersTeam/config'
import { CategoryLanding } from '@/blocks/CategoryLanding/config'
import { ContactForm } from '@/blocks/ContactForm/config'
import { ContactHero } from '@/blocks/ContactHero/config'
import { ContactOffices } from '@/blocks/ContactOffices/config'
import { ContactRoutes } from '@/blocks/ContactRoutes/config'
import { ContactStats } from '@/blocks/ContactStats/config'
import { CrossIndustryPatterns } from '@/blocks/CrossIndustryPatterns/config'
import { Cta } from '@/blocks/Cta/config'
import { FeatureCaseStudy } from '@/blocks/FeatureCaseStudy/config'
import { HeroFeatured } from '@/blocks/HeroFeatured/config'
import { homeSectionBlocks } from '@/blocks/homeSections/config'
import { IndustriesDetails } from '@/blocks/IndustriesDetails/config'
import { IndustriesHero } from '@/blocks/IndustriesHero/config'
import { IndustriesSection } from '@/blocks/IndustriesSection/config'
import { IndustryList } from '@/blocks/IndustryList/config'
import { IndustryPanels } from '@/blocks/IndustryPanels/config'
import { Jobs } from '@/blocks/Jobs/config'
import { QualityBar } from '@/blocks/QualityBar/config'
import { RegulatoryPosture } from '@/blocks/RegulatoryPosture/config'
import { ScalesHero } from '@/blocks/ScalesHero/config'
import { ScaleShowcase } from '@/blocks/ScaleShowcase/config'
import { SolutionFeature } from '@/blocks/SolutionFeature/config'
import { SolutionsEngage } from '@/blocks/SolutionsEngage/config'
import { SolutionsHero } from '@/blocks/SolutionsHero/config'
import { StoriesArchive } from '@/blocks/StoriesArchive/config'
import { StoriesHero } from '@/blocks/StoriesHero/config'
import { Subscribe } from '@/blocks/Subscribe/config'
import { DEFAULT_LOCALE, localizedPath } from '@/lib/i18n/locales'
import { getServerSideURL } from '@/utilities/getURL'

type Breadcrumb = { url?: string | null }

/**
 * Locale codes are reserved as the first URL segment for the upcoming [locale] routing (WEB-445),
 * so a page slug must never shadow one. Keep this list in sync with the `localization.locales`
 * codes in src/payload.config.ts.
 */
const RESERVED_LOCALE_SLUGS = new Set(['en', 'bn'])

/**
 * Build the live-preview / preview-button URL for a page (WEB-449).
 *
 * Routes THROUGH the /next/preview route (src/app/(frontend)/next/preview/route.ts) so that
 * draft mode is enabled before the editor is redirected to the page — without that, the iframe
 * renders the published version and the live-preview listener never receives draft updates.
 *
 * The redirect target (`path`) is the default-locale route (en is unprefixed at the root):
 *   - the home page (slug 'home') → `/`
 *   - any other page → `/<slug>` (or the last breadcrumb url when nested-docs breadcrumbs exist)
 */
const pageUrl = (data?: { slug?: unknown; breadcrumbs?: unknown }): string => {
  const slug = typeof data?.slug === 'string' ? data.slug : ''
  const crumbs = Array.isArray(data?.breadcrumbs) ? (data.breadcrumbs as Breadcrumb[]) : []
  const fromCrumbs = crumbs.length ? crumbs[crumbs.length - 1]?.url : null

  // Routed, root-relative path the previewer should land on after draft mode is enabled.
  // `home` is the site root, so it maps to the locale home (`/` for the default locale).
  const localePath =
    slug === 'home' || !slug
      ? localizedPath(DEFAULT_LOCALE, '/')
      : fromCrumbs
        ? localizedPath(DEFAULT_LOCALE, fromCrumbs)
        : localizedPath(DEFAULT_LOCALE, `/${slug}`)

  return `${getServerSideURL()}/next/preview?path=${encodeURIComponent(localePath)}&collection=pages&slug=${slug}&previewSecret=${process.env.PREVIEW_SECRET}`
}

/**
 * Blocks-based page model (Epic A). Editors compose a page from the reusable block
 * library via `layout`, rather than the structure being frozen in code. Drafts +
 * autosave are enabled so live preview can show unpublished changes.
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    group: 'Pages',
    description: 'Composable, blocks-based pages with drafts and live preview.',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    livePreview: {
      url: ({ data }) => pageUrl(data),
    },
    preview: (data) => pageUrl(data),
  },
  versions: {
    // schedulePublish lets editors pick a future publish time; the Payload jobs queue
    // (jobs.autoRun in payload.config.ts) promotes the scheduled draft when that time arrives.
    drafts: { autosave: { interval: 100 }, schedulePublish: true },
    maxPerDoc: 20,
  },
  hooks: {
    // Reject slugs that collide with a locale code so a page can never shadow the [locale] URL
    // segment introduced in WEB-445. Uses a collection beforeValidate hook (rather than a
    // field-level validate) because the slug field comes from slugField() above.
    beforeValidate: [
      ({ data }) => {
        // Normalize the way slugField()'s slugify() will (trim + lowercase) so that "En",
        // " en ", or "EN" can't slip past and then persist as the reserved slug "en".
        const raw = data?.slug
        const slug = typeof raw === 'string' ? raw.trim().toLowerCase() : raw
        if (typeof slug === 'string' && RESERVED_LOCALE_SLUGS.has(slug)) {
          throw new APIError(`"${raw}" is a reserved locale code and cannot be used as a page slug.`, 400)
        }
        return data
      },
    ],
    // Emit this page's own slug tag plus the collection-wide tag so editor saves bust the cached
    // reads in [locale]/page.tsx and [locale]/[...slug]/page.tsx (tag-based ISR — no time-based
    // revalidate anywhere).
    afterChange: [
      ({ doc }) => {
        if (doc?.slug) {
          revalidateTag(`pages_${doc.slug}`, { expire: 0 })
        }
        revalidateTag('pages', { expire: 0 })
      },
    ],
    // Deletes must bust the same tags, or the deleted page keeps rendering from cache.
    afterDelete: [
      ({ doc }) => {
        if (doc?.slug) {
          revalidateTag(`pages_${doc.slug}`, { expire: 0 })
        }
        revalidateTag('pages', { expire: 0 })
      },
    ],
  },
  fields: [
    { name: 'title', label: 'Title', type: 'text', required: true, localized: true },
    slugField(),
    {
      name: 'layout',
      label: 'Layout',
      type: 'blocks',
      blocks: [
        HeroFeatured,
        Jobs,
        IndustriesSection,
        ...homeSectionBlocks,
        // Capabilities landing: the practice ledger that follows the capabilities grid.
        CapabilityLedger,
        // Granular redesign blocks (Phase 2 — decomposed from the monolith page blocks).
        ScalesHero,
        QualityBar,
        ScaleShowcase,
        // Granular redesign blocks (Phase 2)
        ContactHero,
        ContactStats,
        ContactRoutes,
        ContactOffices,
        ContactForm,
        StoriesHero,
        FeatureCaseStudy,
        StoriesArchive,
        CategoryLanding,
        Subscribe,
        IndustriesHero,
        IndustryList,
        IndustriesDetails,
        IndustryPanels,
        CrossIndustryPatterns,
        RegulatoryPosture,
        SolutionsHero,
        SolutionFeature,
        SolutionsEngage,
        AboutHero,
        AboutFundingStory,
        AboutIntro,
        AboutThesis,
        AboutBeliefs,
        AboutApproach,
        AboutProofOfScale,
        AboutLeadership,
        CareersHero,
        CareersGridOne,
        CareersGridTwo,
        CareersGrowth,
        CareersTeam,
        Cta,
      ],
    },
  ],
}

export default Pages
