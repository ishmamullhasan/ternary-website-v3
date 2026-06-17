'use client'

import 'swiper/css'

import { cn } from '@/lib/utils'
import type { Media, Team } from '@/payload-types'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'
import { motion } from 'motion/react'
import type { JSX } from 'react'
import { useState } from 'react'
import type { Swiper as SwiperType } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'

const gradientBackgrounds = [
  'bg-linear-to-br from-[#1f2b3a] via-[#2d3f57] to-[#415a77]',
  'bg-linear-to-br from-[#231733] via-[#3a2752] to-[#573a79]',
  'bg-linear-to-br from-[#152724] via-[#1f3a35] to-[#2d5a52]',
  'bg-linear-to-br from-[#2a1b1f] via-[#4a2a31] to-[#6f3f49]',
  'bg-linear-to-br from-[#1d2433] via-[#273a56] to-[#35507a]',
] as const

type CareerCardItem = {
  title: string
  desc: string
  imageBg?: string
}

type CorouselProps =
  | {
      variant?: 'team'
      navVariant?: 'arrows' | 'dots'
      items: Team[]
    }
  | {
      variant: 'careerCards'
      navVariant?: 'arrows' | 'dots'
      items: CareerCardItem[]
    }

export default function Corousel({ items, variant = 'team', navVariant = 'arrows' }: CorouselProps): JSX.Element {
  const [swiper, setSwiper] = useState<SwiperType | null>(null)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const syncNavButtons = (instance: SwiperType) => {
    setCanScrollPrev(!instance.isBeginning)
    setCanScrollNext(!instance.isEnd)
    setActiveIndex(instance.realIndex)
  }

  return (
    <>
      <motion.div
        className="-mx-4 px-4 lg:mx-0 lg:px-0 pb-4 overflow-hidden"
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.25 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <Swiper
          onSwiper={(instance) => {
            setSwiper(instance)
            syncNavButtons(instance)
          }}
          onSlideChange={(instance) => {
            syncNavButtons(instance)
          }}
          onResize={syncNavButtons}
          onBreakpoint={syncNavButtons}
          onReachBeginning={syncNavButtons}
          onReachEnd={syncNavButtons}
          onFromEdge={syncNavButtons}
          slidesPerView={variant === 'careerCards' ? 1.08 : 1.15}
          spaceBetween={16}
          breakpoints={
            variant === 'careerCards'
              ? {
                  640: { slidesPerView: 1.35, spaceBetween: 20 },
                }
              : {
                  640: { slidesPerView: 1.7, spaceBetween: 20 },
                  1024: { slidesPerView: 3.3, spaceBetween: 24 },
                }
          }
          touchRatio={1}
          touchReleaseOnEdges
        >
          {items.map((item, i) => {
            const fallbackGradient = gradientBackgrounds[i % gradientBackgrounds.length]

            if (variant === 'careerCards') {
              const card = item as CareerCardItem

              return (
                <SwiperSlide key={i}>
                  <div className="relative aspect-square rounded-lg overflow-hidden border border-white/5 bg-main p-6">
                    {card.imageBg ? (
                      <>
                        <img
                          src={card.imageBg}
                          alt={card.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] via-[#0a0a0a]/45 to-transparent" />
                      </>
                    ) : (
                      <>
                        <div className={cn('absolute inset-0', fallbackGradient)} />
                        <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a]/75 via-[#0a0a0a]/35 to-transparent" />
                      </>
                    )}
                    <div className="relative z-10 h-full flex flex-col justify-end">
                      <h3 className="text-lg font-medium text-white mb-2 tracking-tight">{card.title}</h3>
                      <p className="text-zinc-300 text-sm leading-relaxed">{card.desc}</p>
                    </div>
                  </div>
                </SwiperSlide>
              )
            }

            const teamItem = item as Team
            const imageUrl =
              typeof teamItem.image === 'object' && teamItem.image !== null ? (teamItem.image as Media).url : undefined
            const hasImage = Boolean(imageUrl)

            return (
              <SwiperSlide key={i}>
                <div className="relative h-[480px] rounded-xl lg:rounded-lg overflow-hidden">
                  {hasImage ? (
                    <>
                      <img
                        src={imageUrl || ''}
                        alt={teamItem.name || 'Team member'}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent"></div>
                      <button className="absolute top-6 right-6 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform z-10 shadow-lg">
                        <Play className="w-4 h-4 text-black ml-1" fill="currentColor" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className={`absolute inset-0 ${fallbackGradient}`}></div>
                      <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a]/70 via-[#0a0a0a]/30 to-transparent"></div>
                    </>
                  )}

                  <div className="absolute bottom-0 left-0 p-8 w-full z-10 flex flex-col justify-end h-full">
                    <p className="text-white text-[17px] font-medium leading-snug mb-8">
                      &ldquo;{teamItem.excerpt}&rdquo;
                    </p>
                    <div>
                      <div className="text-white text-sm font-medium">{teamItem.name}</div>
                      <div className="text-zinc-400 text-sm mt-0.5">{teamItem.position}</div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            )
          })}
        </Swiper>
      </motion.div>

      {navVariant === 'dots' ? (
        <motion.div
          className="flex justify-center gap-2 mt-4"
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {items.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => swiper?.slideTo(index)}
              className={cn(
                'h-2 rounded-full transition-all duration-200',
                activeIndex === index ? 'w-5 bg-white' : 'w-2 bg-white/30 hover:bg-white/50',
              )}
            />
          ))}
        </motion.div>
      ) : (
        <motion.div
          className="flex justify-end gap-3 mt-4"
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <button
            type="button"
            onClick={() => swiper?.slidePrev()}
            disabled={!canScrollPrev}
            className="w-10 h-10 rounded-full border border-white/5 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            type="button"
            onClick={() => swiper?.slideNext()}
            disabled={!canScrollNext}
            className="w-10 h-10 rounded-full border border-white/5 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </motion.div>
      )}
    </>
  )
}
