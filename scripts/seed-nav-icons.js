// Adds icons to every mega-menu sub-item and ensures each top-level item links to its hub, on the
// STAGING cluster. Icons come from the header's allowed set (src/globals/nav/iconOptions.ts). The
// MegaMenuOverlay already renders item.icon via NavIcon — this just fills the data. Idempotent.
// Run: mongosh "mongodb+srv://…/ternary-local" --file scripts/seed-nav-icons.js

// slug/label → icon (matched from NAV_ICON_OPTIONS)
const ICON = {
  // Capabilities
  'Agentic Architecture': 'network',
  'Artificial Intelligence': 'brain',
  'Data & Analytics': 'database',
  'Cloud Transformation': 'cloud',
  Platformization: 'layers',
  'Digital Experiences': 'smartphone',
  'DevOps & Automation': 'zap',
  'Internet of Things': 'cpu',
  // Solutions
  'Product Development': 'rocket',
  'Enterprise Transformation': 'building',
  'Engineering Augmentation': 'users',
  'Managed Systems': 'server',
  // Industries
  'Banking & Capital Markets': 'landmark',
  'Financial Services & Insurance': 'line-chart',
  'Public Sector': 'shield-check',
  'Technology Platforms': 'cpu',
  'Advanced Manufacturing': 'factory',
  'Health Care': 'heart-pulse',
  'Sports & Entertainment': 'trophy',
  'Hospitality & Travel': 'plane',
  'Consumer Goods & Services': 'shopping-bag',
}

// Top-level items must each carry a hub link (so clicking navigates). Capabilities was empty.
const HUB_LINK = { Capabilities: '/capabilities', Solutions: '/solutions', Industries: '/industries' }

const h = db.globals.findOne({ globalType: 'header' })
let iconCount = 0
let linkCount = 0
h.menu.forEach((m) => {
  const label = m.label && (m.label.en || m.label)
  if (HUB_LINK[label] && !m.link) {
    m.link = HUB_LINK[label]
    linkCount++
  }
  const cols = (m.panel && m.panel.columns) || []
  cols.forEach((col) => {
    ;(col.items || []).forEach((it) => {
      const l = it.label && (it.label.en || it.label)
      if (ICON[l]) {
        it.icon = ICON[l]
        iconCount++
      } else {
        print('  no icon mapped for: ' + l)
      }
    })
  })
})
db.globals.updateOne({ _id: h._id }, { $set: { menu: h.menu, updatedAt: new Date() } })
print('DONE — set ' + iconCount + ' item icons, ' + linkCount + ' hub links')
