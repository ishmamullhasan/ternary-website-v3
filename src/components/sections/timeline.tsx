import clsx from 'clsx'
import { CardTitle } from '../ui/card'

type TimelineItem = { date?: string | null; title?: string | null }

export default function Journey({
  items = [],
  className,
}: {
  items?: TimelineItem[] | null
  className?: string
}) {
  const timelineEvents = items?.filter((item) => item?.title) ?? []

  return (
    <div className={clsx('w-full relative', className)}>
      {timelineEvents.length > 0 && (
        <div className="relative flex w-full gap-4">
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-muted z-0" />

          {timelineEvents.map((event, index) => (
            <div
              key={index}
              className={clsx(
                'relative flex flex-col items-left transform w-full',
                index % 2 === 0
                  ? '-translate-y-[54px] xl:-translate-y-[44px]'
                  : 'translate-y-[54px] xl:translate-y-[44px]',
              )}
            >
              {index % 2 === 0 ? (
                <>
                  <div className="mb-2 shadow-md py-2 pr-2 rounded-lg text-left">
                    <span className="text-xs font-medium opacity-60">{event.date}</span>
                    <CardTitle className="text-sm tracking-tight font-light w-[100%] xl:w-[100%]">
                      {event.title}
                    </CardTitle>
                  </div>
                  <div className="mr-2 w-4 h-4 bg-primary rounded-full z-10" />
                </>
              ) : (
                <>
                  <div className="mr-2 w-4 h-4 bg-primary rounded-full z-10" />
                  <div className="mt-2 shadow-md py-2 pr-2 rounded-lg text-left">
                    <span className="text-xs font-medium opacity-60">{event.date}</span>
                    <CardTitle className="text-sm tracking-tight font-light xl:w-[100%]">
                      {event.title}
                    </CardTitle>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
