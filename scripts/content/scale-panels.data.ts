// Bilingual bespoke-panel content for the 3 Scale showcase tiers, per the Figma designs
// (nodes 1459-5723 sprint, 1468-4333 roadmap, 1468-4517 procurement). subTitle = pill,
// title = tagline heading (per the field-mapping decision). Localized leaves are { en, bn }.
export type Loc = { en: string; bn: string }

export const richText = (text: string) => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: [
      {
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr' as const,
        textFormat: 0,
        textStyle: '',
        children: [{ type: 'text', text, format: 0, style: '', mode: 'normal', detail: 0, version: 1 }],
      },
    ],
  },
})
const lex = (en: string, bn: string) => ({ en: richText(en), bn: richText(bn) })
const pod = (title: Loc, value: Loc) => ({ title, value })

export const TIERS = [
  {
    slug: 'startups-and-scale-ups',
    panelType: 'sprint',
    subTitle: { en: 'Startups & Scale-ups', bn: 'স্টার্টআপ ও স্কেল-আপ' },
    title: { en: 'One pod. Daily ship cadence.', bn: 'একটি পড। প্রতিদিন শিপিং ছন্দ।' },
    tags: { en: 'Lean · Agentic · Velocity-led', bn: 'লিন · এজেন্টিক · ভেলোসিটি-চালিত' },
    description: lex(
      'A single embedded pod — usually 2 to 4 people — moving at agentic velocity. Async-first, zero ceremony. We act as your founding engineering bench until you have one of your own.',
      'একটি নিবিষ্ট পড — সাধারণত ২ থেকে ৪ জন — এজেন্টিক গতিতে এগিয়ে চলে। অ্যাসিঙ্ক-ফার্স্ট, শূন্য আনুষ্ঠানিকতা। আপনার নিজস্ব দল তৈরি না হওয়া পর্যন্ত আমরা আপনার প্রতিষ্ঠাতা ইঞ্জিনিয়ারিং বেঞ্চ হিসেবে কাজ করি।',
    ),
    sprintMeta: {
      statusLabel: { en: 'Live sprint · day 23', bn: 'লাইভ স্প্রিন্ট · দিন ২৩' },
      cadenceLabel: { en: 'cycle 1.8d · lead 6h', bn: 'সাইকেল ১.৮দি · লিড ৬ঘ' },
    },
    showUp: [
      {
        number: '01',
        title: { en: 'Founder-direct Slack', bn: 'ফাউন্ডার-ডিরেক্ট স্ল্যাক' },
        subtext: {
          en: 'No account managers. No hand-offs.',
          bn: 'কোনো অ্যাকাউন্ট ম্যানেজার নেই। কোনো হ্যান্ড-অফ নেই।',
        },
      },
      {
        number: '02',
        title: { en: 'MVP → production in 4–8 weeks', bn: 'MVP → প্রোডাকশন ৪–৮ সপ্তাহে' },
        subtext: {
          en: 'Small surface, real users, real telemetry.',
          bn: 'ছোট সারফেস, বাস্তব ব্যবহারকারী, বাস্তব টেলিমেট্রি।',
        },
      },
      {
        number: '03',
        title: { en: 'Co-build mode', bn: 'কো-বিল্ড মোড' },
        subtext: {
          en: 'We transfer code, context, and craft on exit.',
          bn: 'প্রস্থানের সময় আমরা কোড, কনটেক্সট ও দক্ষতা হস্তান্তর করি।',
        },
      },
    ],
    sprintLog: [
      { day: 'D23', label: { en: 'auth · magic-link', bn: 'auth · magic-link' }, status: 'shipped' },
      { day: 'D22', label: { en: 'billing · stripe webhooks', bn: 'billing · stripe webhooks' }, status: 'shipped' },
      { day: 'D21', label: { en: 'onboarding · 3-step', bn: 'onboarding · 3-step' }, status: 'in-review' },
      { day: 'D20', label: { en: 'agentic search v0', bn: 'agentic search v0' }, status: 'in-build' },
      { day: 'D19', label: { en: 'team invites', bn: 'team invites' }, status: 'queued' },
    ],
    podSize: [
      pod({ en: 'Pod size', bn: 'পড সাইজ' }, { en: '2–4', bn: '২–৪' }),
      pod({ en: 'Engagement', bn: 'এনগেজমেন্ট' }, { en: '6–16 wk', bn: '৬–১৬ সপ্তাহ' }),
    ],
  },
  {
    slug: 'mid-market-and-enterprise',
    panelType: 'roadmap',
    subTitle: { en: 'Mid-Market & Enterprise', bn: 'মিড-মার্কেট ও এন্টারপ্রাইজ' },
    title: { en: 'Programs measured in quarters, not sprints.', bn: 'প্রোগ্রাম মাপা হয় ত্রৈমাসিকে, স্প্রিন্টে নয়।' },
    tags: { en: 'Modernization · Multi-quarter programs', bn: 'আধুনিকায়ন · মাল্টি-কোয়ার্টার প্রোগ্রাম' },
    description: lex(
      'Multi-pod programs that pair our platform engineers with your domain experts. We modernize alongside — strangler-fig migrations, measured cutovers, joint steering.',
      'মাল্টি-পড প্রোগ্রাম যা আমাদের প্ল্যাটফর্ম ইঞ্জিনিয়ারদের আপনার ডোমেইন বিশেষজ্ঞদের সাথে যুক্ত করে। আমরা পাশাপাশি আধুনিকায়ন করি — স্ট্র্যাঙ্গলার-ফিগ মাইগ্রেশন, পরিমাপিত কাটওভার, যৌথ স্টিয়ারিং।',
    ),
    roadmapMeta: {
      label: { en: 'Program roadmap', bn: 'প্রোগ্রাম রোডম্যাপ' },
      span: { en: '4 quarters · FY2026', bn: '৪ ত্রৈমাসিক · FY2026' },
    },
    roadmap: [
      {
        phase: { en: 'Discovery & inception', bn: 'ডিসকভারি ও সূচনা' },
        startQuarter: 'Q1',
        endQuarter: 'Q1',
        progress: 100,
      },
      {
        phase: { en: 'Platform foundation', bn: 'প্ল্যাটফর্ম ফাউন্ডেশন' },
        startQuarter: 'Q1',
        endQuarter: 'Q2',
        progress: 80,
      },
      {
        phase: { en: 'Strangler migration', bn: 'স্ট্র্যাঙ্গলার মাইগ্রেশন' },
        startQuarter: 'Q2',
        endQuarter: 'Q3',
        progress: 55,
      },
      { phase: { en: 'Agentic surfaces', bn: 'এজেন্টিক সারফেস' }, startQuarter: 'Q3', endQuarter: 'Q3', progress: 30 },
      {
        phase: { en: 'Hardening & handover', bn: 'হার্ডেনিং ও হ্যান্ডওভার' },
        startQuarter: 'Q4',
        endQuarter: 'Q4',
        progress: 10,
      },
    ],
    footnotes: [
      {
        number: '01',
        title: { en: 'Joint steering committee', bn: 'যৌথ স্টিয়ারিং কমিটি' },
        subtext: { en: 'Quarterly OKRs and shared scorecards.', bn: 'ত্রৈমাসিক OKR ও শেয়ার্ড স্কোরকার্ড।' },
      },
      {
        number: '02',
        title: { en: 'MSA + SOW', bn: 'MSA + SOW' },
        subtext: {
          en: 'Security review path included from kickoff.',
          bn: 'কিকঅফ থেকেই সিকিউরিটি রিভিউ পাথ অন্তর্ভুক্ত।',
        },
      },
      {
        number: '03',
        title: { en: 'Embedded uplift', bn: 'এমবেডেড আপলিফট' },
        subtext: {
          en: 'Your engineers leave the program stronger.',
          bn: 'আপনার ইঞ্জিনিয়াররা প্রোগ্রাম শেষে আরও দক্ষ হয়ে ওঠে।',
        },
      },
    ],
    podSize: [
      pod({ en: 'Pod size', bn: 'পড সাইজ' }, { en: '2–6', bn: '২–৬' }),
      pod({ en: 'Program', bn: 'প্রোগ্রাম' }, { en: '2–6 qtrs', bn: '২–৬ ত্রৈমাসিক' }),
    ],
  },
  {
    slug: 'public-sector',
    panelType: 'procurement',
    subTitle: { en: 'Public Sector', bn: 'পাবলিক সেক্টর' },
    title: {
      en: 'Cleared engineers. ATO-ready from kickoff.',
      bn: 'ক্লিয়ার্ড ইঞ্জিনিয়ার। কিকঅফ থেকেই ATO-প্রস্তুত।',
    },
    tags: { en: 'Auditability · Security · Mission timelines', bn: 'অডিটেবিলিটি · সিকিউরিটি · মিশন টাইমলাইন' },
    description: lex(
      'Prime or sub on established vehicles, with evidence pipelines and continuous compliance baked in. We deliver against mission deadlines — not procurement cycles.',
      'প্রতিষ্ঠিত ভেহিকলে প্রাইম বা সাব হিসেবে, এভিডেন্স পাইপলাইন ও ধারাবাহিক কমপ্লায়েন্স অন্তর্নির্মিত। আমরা মিশন ডেডলাইন অনুযায়ী ডেলিভার করি — প্রকিউরমেন্ট সাইকেল নয়।',
    ),
    capability: [
      {
        term: { en: 'Reference architecture', bn: 'রেফারেন্স আর্কিটেকচার' },
        value: { en: 'FedRAMP Moderate / High', bn: 'FedRAMP Moderate / High' },
      },
      {
        term: { en: 'Talent', bn: 'ট্যালেন্ট' },
        value: { en: 'Cleared · CMMI Level 3', bn: 'ক্লিয়ার্ড · CMMI লেভেল ৩' },
      },
      {
        term: { en: 'Vehicles', bn: 'ভেহিকল' },
        value: { en: 'GSA MAS · GWAC · OTA · state MSA', bn: 'GSA MAS · GWAC · OTA · state MSA' },
      },
      {
        term: { en: 'Posture', bn: 'পসচার' },
        value: { en: 'CUI · CJIS · classified-aware', bn: 'CUI · CJIS · classified-aware' },
      },
      {
        term: { en: 'Compliance', bn: 'কমপ্লায়েন্স' },
        value: { en: 'Continuous monitoring · monthly evidence', bn: 'ধারাবাহিক মনিটরিং · মাসিক এভিডেন্স' },
      },
    ],
    procurementPath: [
      {
        number: '01',
        title: { en: 'Sources sought / RFI', bn: 'সোর্সেস সট / RFI' },
        subtext: {
          en: 'Capability statement, past performance, mission fit.',
          bn: 'ক্যাপাবিলিটি স্টেটমেন্ট, অতীত কর্মদক্ষতা, মিশন ফিট।',
        },
      },
      {
        number: '02',
        title: { en: 'Vehicle alignment', bn: 'ভেহিকল অ্যালাইনমেন্ট' },
        subtext: {
          en: 'GSA MAS · GWAC · OTA · state MSA — primed or subbed.',
          bn: 'GSA MAS · GWAC · OTA · state MSA — প্রাইম বা সাব।',
        },
      },
      {
        number: '03',
        title: { en: 'Solicitation response', bn: 'সলিসিটেশন রেসপন্স' },
        subtext: {
          en: 'Technical, management, and price volumes written by engineers.',
          bn: 'টেকনিক্যাল, ম্যানেজমেন্ট ও প্রাইস ভলিউম ইঞ্জিনিয়ারদের লেখা।',
        },
      },
      {
        number: '04',
        title: { en: 'Award & ATO', bn: 'অ্যাওয়ার্ড ও ATO' },
        subtext: {
          en: 'Authority to operate · continuous monitoring · evidence pipeline live.',
          bn: 'অথরিটি টু অপারেট · ধারাবাহিক মনিটরিং · এভিডেন্স পাইপলাইন লাইভ।',
        },
      },
      {
        number: '05',
        title: { en: 'Mission delivery', bn: 'মিশন ডেলিভারি' },
        subtext: {
          en: 'Sprint cadence on classified or controlled enclaves.',
          bn: 'ক্লাসিফায়েড বা কন্ট্রোল্ড এনক্লেভে স্প্রিন্ট ছন্দ।',
        },
      },
    ],
    podSize: [
      pod({ en: 'Pod size', bn: 'পড সাইজ' }, { en: '12+', bn: '১২+' }),
      pod({ en: 'ATO path', bn: 'ATO পাথ' }, { en: '2–3m', bn: '২–৩ মাস' }),
      pod({ en: 'Audit pass', bn: 'অডিট পাস' }, { en: '100%', bn: '১০০%' }),
    ],
  },
] as const

// Project a bilingual structure down to one locale's flat values (for per-locale Local API writes).
export const projectLocale = (value: any, locale: 'en' | 'bn'): any => {
  if (Array.isArray(value)) return value.map((v) => projectLocale(v, locale))
  if (value && typeof value === 'object') {
    const keys = Object.keys(value)
    if (keys.length > 0 && keys.every((k) => k === 'en' || k === 'bn')) return value[locale] ?? value.en ?? value.bn
    const out: Record<string, any> = {}
    for (const k of keys) out[k] = projectLocale(value[k], locale)
    return out
  }
  return value
}
