import Image from 'next/image'
import { getMediaUrl } from '@/utilities/getMediaUrl'

const DEFAULT_HEADING = 'Building products that shape the lives of millions every single day.'
const DEFAULT_IMAGE = '/ternary_home_cover.png'

function getImageUrl(image: { url?: string | null } | string | null | undefined): string {
  if (!image) return DEFAULT_IMAGE
  if (typeof image === 'string') return DEFAULT_IMAGE
  const url = image?.url
  return url ? getMediaUrl(url) : DEFAULT_IMAGE
}

export default function HeroSection({
  hero,
}: {
  hero?: { heading?: string | null; image?: { url?: string | null } | string | null } | null
}) {
  const heading = hero?.heading ?? DEFAULT_HEADING
  const imageUrl = getImageUrl(hero?.image)

  return (
    <section className="-my-10 lg:-my-0 flex flex-col gap-4 md:gap-10 w-full">
      <h1 className="px-6 md:px-10 scroll-m-20 text-3xl md:text-4xl lg:text-5xl font-light tracking-tight max-w-[90%] md:max-w-[800px]">
        {heading}
      </h1>

      <Image
        src={imageUrl}
        alt="Hero Image"
        className="object-cover border-t border-b border-white/20"
        width={2560}
        height={1000}
      />
    </section>
  )
}
