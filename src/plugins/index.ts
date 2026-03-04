import { seoPlugin } from '@payloadcms/plugin-seo'
import { Plugin } from 'payload'
import { getServerSideURL } from '@/utilities/getURL'

const generateTitle = ({ doc }: { doc?: { title?: string | null } }) => {
  return doc?.title ? `${doc.title} | Ternary Solutions` : 'Ternary Solutions'
}

const generateURL = ({ doc }: { doc?: { slug?: string | null } }) => {
  const url = getServerSideURL()
  return doc?.slug ? `${url}/${doc.slug}` : url
}

export const plugins: Plugin[] = [
  seoPlugin({
    generateTitle,
    generateURL,
  }),
]
