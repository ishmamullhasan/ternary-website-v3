// English content for the three legal pages (privacy / terms / modern slavery). The legal `content`
// field is localized richText with fallback:true, so seeding `en` is enough — `bn` falls back to en.
// These are professional templates for Ternary Solutions; have counsel review before relying on them
// (the page's own compliance notice says as much).
//
// Block DSL: { h: '...' } heading (h2) | { p: '...' } paragraph | { ul: [...] } bullet list.
export type Block = { h: string } | { p: string } | { ul: string[] }

export const COMPANY = 'Ternary Solutions'

export const PRIVACY: Block[] = [
  {
    p: `This Privacy Policy explains how ${COMPANY} ("we", "us", or "our") collects, uses, discloses, and safeguards your information when you visit our website, engage our services, or otherwise interact with us. We are committed to protecting your privacy and handling your personal data transparently and in accordance with applicable data protection laws.`,
  },

  { h: 'Information We Collect' },
  {
    p: 'We collect information that you provide directly to us, information collected automatically when you use our services, and information from third parties where permitted by law.',
  },
  {
    ul: [
      'Contact details such as your name, email address, telephone number, and company.',
      'Information you provide when you contact us, request a proposal, or apply for a role.',
      'Technical data including IP address, browser type, device information, and pages visited.',
      'Usage data describing how you interact with our website and services.',
    ],
  },

  { h: 'How We Use Your Information' },
  {
    p: 'We use the information we collect to operate, maintain, and improve our services, and to communicate with you.',
  },
  {
    ul: [
      'To respond to your enquiries and provide the services you request.',
      'To deliver, maintain, secure, and improve our website and services.',
      'To send administrative information, updates, and, where you have consented, marketing communications.',
      'To comply with legal obligations and enforce our agreements.',
    ],
  },

  { h: 'Legal Bases for Processing' },
  {
    p: 'Where applicable law requires it, we process personal data on the basis of your consent, the performance of a contract with you, our legitimate business interests, or compliance with a legal obligation.',
  },

  { h: 'Sharing and Disclosure' },
  {
    p: 'We do not sell your personal data. We may share information with trusted service providers who process data on our behalf, with professional advisers, in connection with a corporate transaction, or where required by law or to protect our rights.',
  },

  { h: 'Data Security' },
  {
    p: 'We maintain administrative, technical, and physical safeguards designed to protect your information against unauthorised access, alteration, disclosure, or destruction. No method of transmission or storage is completely secure, and we cannot guarantee absolute security.',
  },

  { h: 'International Data Transfers' },
  {
    p: 'We operate globally, and your information may be transferred to and processed in countries other than your own. Where we transfer personal data internationally, we put appropriate safeguards in place as required by applicable law.',
  },

  { h: 'Data Retention' },
  {
    p: 'We retain personal data only for as long as necessary to fulfil the purposes for which it was collected, including to satisfy legal, accounting, or reporting requirements, after which it is securely deleted or anonymised.',
  },

  { h: 'Your Rights' },
  {
    p: 'Subject to applicable law, you may have the right to access, correct, delete, or restrict the processing of your personal data, to object to processing, and to data portability.',
  },
  {
    ul: [
      'Request access to the personal data we hold about you.',
      'Request correction or deletion of your personal data.',
      'Object to or request restriction of certain processing.',
      'Withdraw consent at any time where processing is based on consent.',
    ],
  },

  { h: 'Cookies and Tracking' },
  {
    p: 'Our website uses cookies and similar technologies to operate the site, remember your preferences, and understand how the site is used. You can control cookies through your browser settings; disabling some cookies may affect site functionality.',
  },

  { h: 'Changes to This Policy' },
  {
    p: 'We may update this Privacy Policy from time to time. When we do, we will revise the "Last Updated" date above and, where appropriate, provide additional notice.',
  },

  { h: 'Contact Us' },
  {
    p: 'If you have questions about this Privacy Policy or wish to exercise your rights, please contact us at privacy@ternary.solutions.',
  },
]

export const TERMS: Block[] = [
  {
    p: `These Terms of Service ("Terms") govern your access to and use of the website and services provided by ${COMPANY} ("we", "us", or "our"). By accessing or using our services, you agree to be bound by these Terms. If you do not agree, you must not use our services.`,
  },

  { h: 'Use of Our Services' },
  {
    p: 'You may use our services only in compliance with these Terms and all applicable laws. We grant you a limited, non-exclusive, non-transferable right to access and use our website and services for their intended purpose.',
  },

  { h: 'Acceptable Use' },
  { p: 'You agree not to misuse our services. The following conduct is prohibited:' },
  {
    ul: [
      'Interfering with or disrupting the integrity or performance of our services.',
      'Attempting to gain unauthorised access to our systems or networks.',
      'Using our services to infringe the intellectual property or rights of others.',
      'Engaging in any unlawful, fraudulent, or harmful activity.',
    ],
  },

  { h: 'Intellectual Property' },
  {
    p: 'All content, trademarks, software, and materials made available through our services are owned by or licensed to us and are protected by intellectual property laws. Except as expressly permitted, you may not copy, modify, distribute, or create derivative works from our materials.',
  },

  { h: 'Client Engagements' },
  {
    p: 'Where we provide engineering, consulting, or delivery services, the specific scope, deliverables, fees, and ownership of work product are governed by a separate written agreement (such as a master services agreement and statement of work). In the event of a conflict, that agreement prevails over these Terms.',
  },

  { h: 'Confidentiality' },
  {
    p: 'Each party agrees to protect the other party’s confidential information with reasonable care and to use it only for the purposes of the engagement, except where disclosure is required by law.',
  },

  { h: 'Warranties and Disclaimers' },
  {
    p: 'Except as expressly stated in a written agreement, our website and services are provided "as is" and "as available" without warranties of any kind, whether express, implied, or statutory, including any implied warranties of merchantability, fitness for a particular purpose, or non-infringement.',
  },

  { h: 'Limitation of Liability' },
  {
    p: 'To the maximum extent permitted by law, we will not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or data, arising out of or related to your use of our services.',
  },

  { h: 'Indemnification' },
  {
    p: 'You agree to indemnify and hold us harmless from any claims, damages, liabilities, and expenses arising out of your misuse of our services or your breach of these Terms.',
  },

  { h: 'Termination' },
  {
    p: 'We may suspend or terminate your access to our services at any time if you breach these Terms or where required to protect our services or comply with law. Provisions that by their nature should survive termination will continue to apply.',
  },

  { h: 'Governing Law' },
  {
    p: 'These Terms are governed by the laws of the jurisdiction in which we are established, without regard to conflict-of-laws principles. Any disputes will be subject to the exclusive jurisdiction of the competent courts of that jurisdiction.',
  },

  { h: 'Changes to These Terms' },
  {
    p: 'We may modify these Terms from time to time. The "Last Updated" date above reflects the most recent revision. Your continued use of our services after changes take effect constitutes acceptance of the updated Terms.',
  },

  { h: 'Contact' },
  { p: 'If you have any questions about these Terms, please contact us at legal@ternary.solutions.' },
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
