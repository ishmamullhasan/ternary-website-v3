// English content for the three legal pages (privacy / terms / modern slavery). The legal `content`
// field is localized richText with fallback:true, so seeding `en` is enough — `bn` falls back to en.
//
// PRIVACY and TERMS are transcribed from the counsel-drafted source PDFs
// (Desktop/ternary website/{privacy-policy,terms-of-service} (1).pdf). Every company-specific fact
// the drafts left open is preserved verbatim as a `[CONFIRM: …]` marker — DO NOT invent these; the
// user supplies them, then they replace the markers in place. Have counsel review before relying on
// these (the page's own compliance notice says as much).
//
// Block DSL: { h } heading (h2) | { p } paragraph | { ul } bullet list | { table } data table.
// TableData.rows is row-major (each inner array is one row's cells, left to right). headerRow
// (default true) renders the first row as column headers; headerColumn renders each row's first
// cell as a row header (for key/value tables). Rendered by the `table` block converter.
export type TableData = {
  caption?: string
  headerRow?: boolean
  headerColumn?: boolean
  rows: string[][]
}
export type Block = { h: string } | { p: string } | { ul: string[] } | { table: TableData }

export const COMPANY = 'Ternary'

export const PRIVACY: Block[] = [
  {
    table: {
      headerRow: true,
      headerColumn: true,
      rows: [
        ['Field', 'Value'],
        ['Document owner', 'Chief Technology Officer'],
        ['Version', '1.0'],
        ['Effective date', 'On publication'],
        ['Review cycle', 'Annual, or on material change'],
        ['Applies to', 'ternary.solutions and all Ternary Solutions, Inc. business activities'],
      ],
    },
  },

  { h: '1. Who we are and what this policy covers' },
  {
    p: 'Ternary Solutions, Inc. ("Ternary", "we", "us") designs, builds and operates custom software for client organisations. Our operating office is in Dhaka, Bangladesh. [CONFIRM: state or country of incorporation, and the registered address to publish here.]',
  },
  {
    p: 'This policy explains how we handle personal information when you visit our website, contact us, apply for a role with us, or deal with us as a client, supplier or partner.',
  },
  {
    p: 'It does not describe how we handle personal data inside software we build and run on behalf of a client. In those engagements the client decides what data is collected and why, and we act only on their instructions. Section 3 explains that distinction, and section 12 tells you who to contact instead.',
  },

  { h: '2. Contacting us about privacy' },
  {
    p: 'Questions, requests and complaints about this policy or about personal data we hold should go to [CONFIRM: privacy contact address to publish — privacy@ternary.solutions?]. We aim to acknowledge within five business days.',
  },

  { h: '3. Two different roles: controller and processor' },
  {
    p: 'We handle personal data in two distinct capacities, and your rights differ depending on which applies.',
  },
  {
    p: 'As a controller. For our own website visitors, enquirers, job applicants, employees, client contacts and supplier contacts, we decide why and how the data is used. This policy governs that data, and you can exercise the rights in section 9 directly with us.',
  },
  {
    p: "As a processor. When we build or operate a product for a client, personal data belonging to that client's users is processed strictly on the client's documented instructions under a written agreement. The client is the controller. We do not use that data for our own purposes, do not sell it, and do not use it to train models. If you are a user of a client's product and want to exercise a right over your data, contact that organisation; if you approach us, we will pass your request to them and support their response.",
  },

  { h: '4. Information we collect as a controller' },
  {
    table: {
      headerRow: true,
      headerColumn: true,
      rows: [
        ['Category', 'What it includes', 'Where it comes from'],
        [
          'Enquiry and contact data',
          'Name, email address, organisation, message content',
          'You, via our website form or by emailing us',
        ],
        [
          'Client and supplier contact data',
          'Names, business email addresses, telephone numbers, job titles',
          'You or your organisation, in the course of an engagement',
        ],
        [
          'Recruitment data',
          'CV, work history, education, portfolio or code samples, interview notes and assessment scores, references',
          'You, and referees you nominate',
        ],
        [
          'Employee and contractor data',
          'Identity and contact details, contract and payroll data, training and policy acknowledgement records, access and equipment records',
          'You, during onboarding and employment',
        ],
        [
          'Technical and usage data',
          'IP address, browser and device type, pages viewed, referring page, approximate location derived from IP',
          'Automatically, when you use our website',
        ],
        ['Support and correspondence', 'Email threads, meeting notes, tickets you raise', 'You'],
        [
          'Security and access logs',
          'Authentication events, administrative actions, timestamps and source addresses',
          'Automatically, from our systems',
        ],
      ],
    },
  },
  {
    p: 'We do not deliberately collect special category data about website visitors or enquirers. Please do not send us health, biometric, religious, political or similar information through our contact form.',
  },

  { h: '5. Why we use it, and our legal basis' },
  {
    table: {
      headerRow: true,
      headerColumn: true,
      rows: [
        ['Purpose', 'Legal basis'],
        ['Responding to your enquiry', 'Legitimate interests, or steps prior to entering a contract'],
        ['Delivering services and managing an engagement', 'Performance of a contract'],
        ['Invoicing, accounting and tax records', 'Legal obligation, and performance of a contract'],
        [
          'Assessing candidates and making hiring decisions',
          'Steps prior to entering a contract, and legitimate interests',
        ],
        ['Employing and paying staff', 'Performance of a contract, and legal obligation'],
        [
          'Operating, securing and troubleshooting our systems',
          'Legitimate interests, and legal obligation where security law applies',
        ],
        ['Meeting our information security and audit obligations', 'Legitimate interests, and legal obligation'],
        ['Sending occasional updates about our work', 'Consent, which you may withdraw at any time'],
      ],
    },
  },
  {
    p: 'Where we rely on legitimate interests, we have considered whether our interest is overridden by your rights, and we will explain that assessment on request.',
  },

  { h: '6. Cookies and analytics' },
  {
    p: 'Our website uses cookies and similar technologies that are strictly necessary to serve the site, and [CONFIRM: which analytics product, if any, is deployed on ternary.solutions — and whether a consent banner is required for the jurisdictions the site serves]. Strictly necessary cookies cannot be disabled without breaking the site. You can block or delete other cookies through your browser settings.',
  },

  { h: '7. Who we share it with' },
  { p: 'We do not sell personal data, and we do not share it for third-party advertising.' },
  {
    p: 'We share it with service providers who process it on our behalf under contract. Our principal providers are:',
  },
  {
    table: {
      headerRow: true,
      headerColumn: true,
      rows: [
        ['Provider', 'Purpose', 'Primary data location'],
        ['Amazon Web Services', 'Cloud hosting, storage and email delivery', 'ap-southeast-1 (Singapore)'],
        ['Google Workspace', 'Email, calendar, document storage', 'Google global infrastructure'],
        ['Atlassian (Jira, Confluence)', 'Project tracking and internal documentation', 'Atlassian cloud'],
        ['Vercel', 'Front-end hosting', 'Vercel global edge'],
        ['Supabase, Neon', 'Managed PostgreSQL', 'Per-project region'],
        ['Sentry', 'Application error monitoring', 'Sentry cloud'],
        ['Slack', 'Internal communication', 'Slack cloud'],
        ['Vanta', 'Security compliance monitoring', 'Vanta cloud'],
      ],
    },
  },
  {
    p: 'We also disclose personal data to professional advisers, and to a regulator, court or law enforcement body where we are legally required to. If we are ever party to a merger or acquisition, data may transfer as part of that transaction, and we will notify affected individuals.',
  },

  { h: '8. International transfers' },
  {
    p: 'We operate from Bangladesh and use providers whose infrastructure sits outside it, principally in Singapore, the European Union and the United States. Where we transfer personal data originating in the United Kingdom or European Economic Area, we rely on the transfer mechanism specified in our agreement with the relevant provider or client. [CONFIRM: the default transfer mechanism to state publicly — standard contractual clauses, or client-specified terms.]',
  },

  { h: '9. Your rights' },
  { p: 'Subject to the law that applies to you, you may ask us to:' },
  {
    ul: [
      'confirm whether we hold personal data about you, and give you a copy;',
      'correct data that is inaccurate or incomplete;',
      'delete data where we no longer have grounds to keep it;',
      'restrict or object to a particular use, including any use based on legitimate interests;',
      'provide your data in a portable, machine-readable format;',
      'withdraw consent you previously gave, without affecting what we did before you withdrew it.',
    ],
  },
  {
    p: 'We will not charge for a request unless it is manifestly unfounded or excessive. We may ask you to verify your identity before we act, and we will respond within the period the applicable law requires. If we decline a request we will explain why. You may also complain to your data protection authority.',
  },

  { h: '10. How long we keep it' },
  {
    table: {
      headerRow: true,
      headerColumn: true,
      rows: [
        ['Data', 'Retention'],
        ['Website enquiries with no engagement', '[CONFIRM: 12 or 24 months?]'],
        [
          'Unsuccessful candidate records',
          '[CONFIRM: retention period, and whether consent is taken to hold candidates in a talent pool]',
        ],
        [
          'Client engagement and project records',
          '[CONFIRM: commonly 6 or 7 years after closure, for contractual limitation — confirm the period]',
        ],
        ['Employment and payroll records', '[CONFIRM: statutory minimum under Bangladesh labour and tax law]'],
        ['Financial and tax records', '[CONFIRM: statutory minimum]'],
        [
          'Security and access logs',
          'Retained for the period the generating system provides; AWS control-plane events are presently available for 90 days',
        ],
      ],
    },
  },
  {
    p: 'When a retention period ends we delete the data or irreversibly anonymise it. Copies held in backup media are protected by the same confidentiality obligations until they expire on the normal backup cycle.',
  },

  { h: '11. How we protect it' },
  {
    p: 'We run an information security management system aligned to ISO 27001:2022 and SOC 2, monitored continuously in Vanta. Access to systems holding personal data is restricted to named individuals, granted on least privilege, and protected by multi-factor authentication. Data is encrypted in transit and at rest. Staff are bound by confidentiality agreements and receive security awareness training. We maintain an incident response process and will notify affected individuals and regulators where the law requires and within the applicable deadline.',
  },
  {
    p: 'No system is perfectly secure, and we do not claim otherwise. Our security whitepaper describes our controls in more detail and is available on request.',
  },

  { h: '12. Data in products we build for clients' },
  {
    p: 'If you are a user of a product Ternary built or operates for another organisation, that organisation is the controller and its own privacy notice governs your data. Please direct requests to them. If you contact us instead, we will forward your request to the client without undue delay and tell you that we have done so.',
  },

  { h: '13. Children' },
  {
    p: 'Our website and our business services are directed at organisations, not children, and we do not knowingly collect personal data from anyone under [CONFIRM: age threshold appropriate to the jurisdictions served — commonly 16 or 18]. If you believe a child has given us personal data, contact us and we will delete it.',
  },

  { h: '14. Changes to this policy' },
  {
    p: 'We review this policy at least annually and whenever our processing changes materially. The effective date above shows the current version. Where a change materially affects your rights we will take reasonable steps to notify you directly.',
  },

  { h: '15. Contact' },
  { p: 'Ternary Solutions, Inc.' },
  { p: '[CONFIRM: registered address and operating office address to publish]' },
  { p: 'Privacy contact: [CONFIRM: privacy contact address]' },
]

export const TERMS: Block[] = [
  {
    table: {
      headerRow: true,
      headerColumn: true,
      rows: [
        ['Field', 'Value'],
        ['Document owner', 'Chief Technology Officer'],
        ['Version', '1.0'],
        ['Effective date', 'On publication'],
        ['Review cycle', 'Annual, or on material change'],
        ['Applies to', 'ternary.solutions and the information and materials made available through it'],
      ],
    },
  },

  { h: '1. About these terms' },
  {
    p: 'These terms govern your use of the Ternary Solutions, Inc. website at ternary.solutions ("the Site") and any information, materials or downloads made available through it. By using the Site you accept these terms. If you do not accept them, please do not use the Site.',
  },
  {
    p: 'Ternary Solutions, Inc. ("Ternary", "we", "us") is a software design, build and operate company. [CONFIRM: state or country of incorporation, registration number, and registered address to publish here.]',
  },

  { h: '2. What these terms do not cover' },
  {
    p: 'Paid services are governed by a separate contract. If we are engaged to design, build, host or support software for you, that work is governed by the Master Service Agreement and the Statement of Work signed between us. Those documents, not these terms, set out scope, fees, intellectual property ownership, service levels, security commitments, data protection obligations, warranties and liability for the engagement. Where these terms conflict with a signed agreement, the signed agreement prevails.',
  },
  {
    p: 'Products we operate for clients have their own terms. If you use an application that Ternary built or hosts on behalf of another organisation, your relationship is with that organisation under its own terms, not with us.',
  },
  { p: 'These terms therefore concern the Site itself: an informational website.' },

  { h: '3. Permitted use' },
  {
    p: 'You may view, download and print material from the Site for your own reference or for evaluating whether to engage us. You may quote from it with attribution.',
  },
  { p: 'You may not:' },
  {
    ul: [
      'use the Site for any unlawful purpose, or in breach of these terms;',
      'copy, republish or redistribute substantial parts of the Site for commercial purposes without our written permission;',
      'attempt to gain unauthorised access to the Site, its hosting infrastructure, or any connected system;',
      'probe, scan or test the vulnerability of the Site except as permitted under section 7;',
      'introduce malware, or any code intended to damage or impair the Site;',
      'impose an unreasonable load on the Site, including through automated scraping that degrades service for others;',
      'misrepresent your identity or affiliation, or use the Site to impersonate Ternary or its personnel;',
      'remove or obscure any copyright, trade mark or other proprietary notice.',
    ],
  },
  {
    p: 'We may suspend or block access where we reasonably believe these terms have been breached.',
  },

  { h: '4. Intellectual property' },
  {
    p: 'The Site and its contents — text, graphics, layout, logos, code and design — are owned by Ternary or licensed to us, and are protected by copyright and other intellectual property rights. Nothing on the Site transfers any right in our intellectual property to you except the limited permission in section 3.',
  },
  {
    p: 'Client names, logos and marks appearing on the Site belong to their respective owners and are used with permission to identify work we have performed.',
  },
  {
    p: 'Open source components used in the Site remain subject to their own licences, which prevail over these terms in respect of that component.',
  },

  { h: '5. Content on the Site' },
  {
    p: 'We publish material about our services, technology and experience in good faith. It is general information, not advice for your specific circumstances, and it is not an offer capable of acceptance. Case studies and descriptions of prior work illustrate what we have done for others; they do not guarantee a comparable result for you.',
  },
  {
    p: 'We may change, remove or update material at any time without notice. We do not undertake to keep the Site current, though we try.',
  },

  { h: '6. Third-party links' },
  {
    p: "The Site may link to third-party websites. We do not control them, we do not endorse their content, and we are not responsible for them. Following an external link is at your own risk and subject to that site's own terms and privacy notice.",
  },

  { h: '7. Reporting a security issue' },
  {
    p: 'We welcome reports of suspected vulnerabilities in the Site. Please report them to [CONFIRM: security contact address to publish — security@ternary.solutions?] with enough detail to reproduce the issue.',
  },
  {
    p: 'If you are researching in good faith, give us a reasonable opportunity to respond before disclosing publicly, do not access or modify data that is not yours, do not degrade the service for others, and do not use social engineering or physical attacks. Where you follow those principles we will not pursue action against you in respect of the research. We do not currently operate a paid bug bounty.',
  },

  { h: '8. Availability' },
  {
    p: 'We provide the Site on an "as available" basis. We do not promise that it will be uninterrupted, timely or error-free, and we may suspend it for maintenance or for any other reason without notice. Availability commitments for hosted client systems are set out in the relevant Statement of Work, not here.',
  },

  { h: '9. Disclaimers' },
  {
    p: 'To the maximum extent permitted by law, the Site and its contents are provided "as is" and without warranty of any kind, whether express or implied, including implied warranties of merchantability, fitness for a particular purpose, accuracy and non-infringement.',
  },
  {
    p: 'Nothing in these terms excludes or limits liability for death or personal injury caused by negligence, for fraud or fraudulent misrepresentation, or for any liability that cannot lawfully be excluded.',
  },

  { h: '10. Limitation of liability' },
  {
    p: 'Subject to section 9, and to the maximum extent permitted by law, we are not liable for any indirect, incidental, special or consequential loss, nor for loss of profit, revenue, business, goodwill, anticipated saving or data, arising from your use of or inability to use the Site.',
  },
  {
    p: 'Our total aggregate liability arising from your use of the Site is limited to [CONFIRM: a nominal cap appropriate to a free informational site — commonly a small fixed sum. Confirm the figure and currency with the Founder.].',
  },
  {
    p: "This section does not affect liability under a signed Master Service Agreement, which is governed by that agreement's own liability provisions.",
  },

  { h: '11. Indemnity' },
  {
    p: 'You agree to indemnify us against claims, losses and reasonable costs arising from your breach of these terms or your unlawful use of the Site.',
  },

  { h: '12. Privacy' },
  {
    p: 'Our handling of personal data is described in our Privacy Policy, which forms part of these terms. Please read it before using the Site or contacting us.',
  },

  { h: '13. Changes to these terms' },
  {
    p: 'We may amend these terms at any time by publishing an updated version on the Site with a revised effective date. Continued use after publication constitutes acceptance. We recommend reviewing them periodically.',
  },

  { h: '14. Suspension and termination' },
  {
    p: 'We may withdraw or restrict access to the Site, in whole or in part, at any time and without notice. Sections 4, 9, 10, 11 and 15 survive any termination.',
  },

  { h: '15. Governing law and disputes' },
  {
    p: 'These terms and any dispute arising from them are governed by [CONFIRM: governing law — the law of Bangladesh?], and the courts of [CONFIRM: forum — Dhaka?] have exclusive jurisdiction, save that we may seek injunctive relief in any competent court to protect our intellectual property or confidential information.',
  },
  {
    p: 'If any provision is held unenforceable, the remainder continues in force. Our failure to enforce a provision is not a waiver of it.',
  },

  { h: '16. Contact' },
  { p: 'Ternary Solutions, Inc.' },
  { p: '[CONFIRM: registered address and operating office address to publish]' },
  { p: 'General enquiries: [CONFIRM: general contact address]' },
  { p: 'Security reports: [CONFIRM: security contact address]' },
]

export const MODERN_SLAVERY: Block[] = [
  {
    p: `This statement sets out the steps ${COMPANY} takes to understand and address the risks of modern slavery and human trafficking within our business and supply chains. We have zero tolerance for slavery, servitude, forced or compulsory labour, and human trafficking in any form.`,
  },

  { h: 'Our Organisation and Supply Chains' },
  {
    p: 'We are a technology and engineering services organisation operating across multiple regions. Our supply chains include software and cloud providers, professional services, recruitment partners, and suppliers of equipment and office services. We expect the same high standards from everyone we work with.',
  },

  { h: 'Our Policies' },
  {
    p: 'Our policies reflect our commitment to acting ethically and with integrity in all our business relationships.',
  },
  {
    ul: [
      'A code of conduct setting the standards of behaviour expected of our people.',
      'Recruitment and employment practices that verify the right to work and prohibit forced labour.',
      'A whistleblowing channel through which concerns can be raised confidentially.',
      'Supplier expectations requiring compliance with applicable anti-slavery laws.',
    ],
  },

  { h: 'Due Diligence' },
  {
    p: 'We assess and monitor our suppliers and partners, integrate anti-slavery considerations into onboarding, and take steps to address any risks we identify. Where appropriate, we require contractual commitments to ethical labour practices.',
  },

  { h: 'Risk Assessment and Management' },
  {
    p: 'We evaluate the modern slavery risks associated with the sectors, regions, and types of suppliers we engage, and we prioritise our efforts where the risk is greatest. Our predominantly skilled, professional workforce represents a lower inherent risk, but we remain vigilant across our extended supply chain.',
  },

  { h: 'Training and Awareness' },
  {
    p: 'We raise awareness of modern slavery risks among our people and provide guidance to those responsible for procurement and supplier relationships so that they can identify and respond to concerns.',
  },

  { h: 'Measuring Effectiveness' },
  {
    p: 'We review the effectiveness of our approach on an ongoing basis, using indicators such as supplier compliance, the outcome of any investigations, and feedback raised through our reporting channels.',
  },

  { h: 'Our Ongoing Commitment' },
  {
    p: 'We are committed to continually strengthening our controls and to working with our partners to help eliminate modern slavery. Questions about this statement can be directed to legal@ternary.solutions.',
  },
]

export const LEGAL_CONTENT: Record<string, Block[]> = {
  'privacy-and-policy': PRIVACY,
  'terms-of-service': TERMS,
  'modern-slavery-statement': MODERN_SLAVERY,
}
