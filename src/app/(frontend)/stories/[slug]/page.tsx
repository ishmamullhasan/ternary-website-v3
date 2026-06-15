import { createContentDetailPage } from '@/utilities/contentDetailPage'

const { Page, generateMetadata, generateStaticParams } = createContentDetailPage('story')

export { generateMetadata, generateStaticParams }
export default Page
