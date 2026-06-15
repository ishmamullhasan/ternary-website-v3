import { createContentDetailPage } from '@/utilities/contentDetailPage'

const { Page, generateMetadata, generateStaticParams } = createContentDetailPage('insight')

export { generateMetadata, generateStaticParams }
export default Page
