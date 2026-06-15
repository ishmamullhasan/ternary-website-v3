import { getServerSideURL } from '@/utilities/getURL'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { s3Storage } from '@payloadcms/storage-s3'
import { Plugin } from 'payload'

const generateTitle = ({ doc }: { doc?: { title?: string | null } }) => {
  return doc?.title ? `${doc.title} | Ternary Solutions` : 'Ternary Solutions'
}

const generateURL = ({ doc }: { doc?: { slug?: string | null } }) => {
  const url = getServerSideURL()
  return doc?.slug ? `${url}/${doc.slug}` : url
}

const plugins: Plugin[] = [
  payloadCloudPlugin(),
  formBuilderPlugin({
    fields: {
      text: true,
      textarea: true,
      select: true,
      email: true,
      state: true,
      country: true,
      checkbox: true,
      number: true,
      message: true,
      date: true,
      radio: true,
      payment: false,
    },
  }),
  s3Storage({
    collections: {
      media: {
        prefix: process.env.S3_MEDIA_PREFIX,
      },
    },
    bucket: process.env.S3_BUCKET as string,
    config: {
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
      },
      region: process.env.S3_REGION,
      // ... Other S3 configuration
    },
    // clientUploads: true,
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
]

export default plugins
