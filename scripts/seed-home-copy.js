// Corrects home-section description copy on the STAGING cluster: de-number, use canonical names,
// and refresh outdated lists (Solutions listed 3 of 4; Capabilities listed 6 of 8). Idempotent.
// Run: mongosh "mongodb+srv://…/ternary-local" --file scripts/seed-home-copy.js

const lex = (paras) => ({
  en: {
    root: {
      type: 'root',
      version: 1,
      direction: 'ltr',
      format: '',
      indent: 0,
      children: paras.map((t) => ({
        type: 'paragraph',
        version: 1,
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        children: [{ type: 'text', version: 1, text: t, detail: 0, format: 0, mode: 'normal', style: '' }],
      })),
    },
  },
})

const DESC = {
  solutionsSection: [
    'Ways to engage us, one standard of ownership. We build new products, modernize the systems organizations have outgrown, extend established teams with senior engineers, and run what we build in production.',
  ],
  capabilitiesSection: [
    'From agentic architecture and artificial intelligence to data, cloud, platforms, digital experiences, and the Internet of Things — the technical practices behind everything we build and run.',
  ],
  engagementSection: [
    'Frame™ for fixed-scope projects. Flow™ for continuous delivery and ongoing partnership. Orchestra™ for on-demand talent. Different shapes of engagement, one commitment to outcomes.',
  ],
  scalesSection: [
    'From founding teams to national institutions — startups shipping an MVP, mid-market companies modernizing, and enterprises and public institutions transforming operations. The same engineering standard at every size.',
  ],
}

const home = db.pages.findOne({ slug: 'home' })
let n = 0
home.layout.forEach((b) => {
  if (DESC[b.blockType]) {
    b.description = lex(DESC[b.blockType])
    n++
  }
})
db.pages.updateOne({ _id: home._id }, { $set: { layout: home.layout, updatedAt: new Date() } })
print('DONE — corrected copy for ' + n + ' home sections: ' + Object.keys(DESC).join(', '))
