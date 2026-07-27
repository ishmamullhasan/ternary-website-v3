// Tightens story titles on the STAGING cluster so home-hero card titles complete within 2 lines
// (~48 chars at the card's type size). Pure compression of the existing titles — no new claims.
// Run: mongosh "mongodb+srv://…/ternary-local" --file scripts/seed-story-titles.js

const T = {
  'counterfoil-continuum': 'Counterfoil: A Booking Monolith Goes Event-Driven',
  turfly: 'Turfly: Sports-Facility Booking for Bangladesh',
  'alley-analytix': 'AlleyIQ: Bowling Analytics, Firmware to Coaching',
  flex5: 'Flex5: A HIPAA-Grade Digital Health Launch',
  'farogl-odoo-erp': 'FAR Oil & Gas: An Odoo-Centered ERP Program',
  doyouwork: 'DoYouWork: Field-Service Operations for Amistee',
  'hissho-sushiops360': 'Hissho: AI-Enabled Franchise Operations',
  'lankabangla-securities': 'LankaBangla: Air-Gapped AI for Capital Markets',
  'dhaka-stock-exchange': 'Dhaka Stock Exchange: A Bilingual National Platform',
  holcim: 'Holcim: AI Control for an Industrial Digital Twin',
}

let n = 0
for (const slug in T) {
  const r = db.stories.updateOne({ slug }, { $set: { 'title.en': T[slug], updatedAt: new Date() } })
  print(slug + ': matched=' + r.matchedCount + ' → "' + T[slug] + '" (' + T[slug].length + ' chars)')
  if (r.matchedCount) n++
}
print('DONE — tightened ' + n + ' story titles')
