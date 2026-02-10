import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'
import { getMediaUrl } from '@/utilities/getMediaUrl'

type TeamItem = {
  name?: string | null
  title?: string | null
  image?: { url?: string | null } | string | null
  linkedin?: string | null
}

function getImageUrl(image: TeamItem['image']): string | null {
  if (!image) return null
  if (typeof image === 'string') return image
  const url = image?.url
  return url ? getMediaUrl(url) : null
}

export default function TeamSection({
  items = [],
  className,
}: {
  items?: TeamItem[] | null
  className?: string
}) {
  const teamMembers = items?.filter((item) => item?.name) ?? []

  return (
    <div className={clsx('flex flex-col w-full items-left gap-10', className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4 gap-y-8 w-full">
        {teamMembers.map((member, index) => (
          <div
            key={index}
            className="rounded-lg shadow-lg hover:shadow-xl flex flex-row items-start gap-2 transition-shadow duration-300"
          >
            {getImageUrl(member.image) ? (
              <Image
                src={getImageUrl(member.image)!}
                alt={`${member.name}'s headshot`}
                width={40}
                height={40}
                className="rounded-full text-xs"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0" />
            )}
            <div className="flex flex-col h-full">
              <div className="flex flex-row gap-2">
                <span className="text-sm font-semibold">{member.name}</span>

                {member.linkedin && (
                  <Link
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-sm opacity-65 hover:opacity-100"
                  >
                    <svg
                      fill="#FFFFFF"
                      version="1.1"
                      id="Capa_1"
                      xmlns="http://www.w3.org/2000/svg"
                      width="16px"
                      height="16px"
                      viewBox="0 0 32 32"
                    >
                      <g>
                        <path d="M17.303,14.365c0.012-0.015,0.023-0.031,0.031-0.048v0.048H17.303z M32,0v32H0V0H32L32,0z M9.925,12.285H5.153v14.354 h4.772V12.285z M10.237,7.847c-0.03-1.41-1.035-2.482-2.668-2.482c-1.631,0-2.698,1.072-2.698,2.482 c0,1.375,1.035,2.479,2.636,2.479h0.031C9.202,10.326,10.237,9.222,10.237,7.847z M27.129,18.408c0-4.408-2.355-6.459-5.494-6.459 c-2.531,0-3.664,1.391-4.301,2.368v-2.032h-4.77c0.061,1.346,0,14.354,0,14.354h4.77v-8.016c0-0.434,0.031-0.855,0.157-1.164 c0.346-0.854,1.132-1.746,2.448-1.746c1.729,0,2.418,1.314,2.418,3.246v7.68h4.771L27.129,18.408L27.129,18.408z" />
                      </g>
                    </svg>
                  </Link>
                )}
              </div>
              <p className="text-xs font-light opacity-75">{member.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
