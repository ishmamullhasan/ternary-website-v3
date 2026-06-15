import { createContentDetailPage } from '@/utilities/contentDetailPage'

const { Page, generateMetadata, generateStaticParams } = createContentDetailPage('pressRelease')

export { generateMetadata, generateStaticParams }
export default Page
