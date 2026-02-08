import clsx from 'clsx'
import { CardTitle } from '../ui/card'

type TimelineItem = { date?: string | null; title?: string | null }

export default function Journey_SM({
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
        <div className="relative flex flex-col md:flex-row w-full gap-4">
          <div className="absolute bg-muted z-0 md:top-1/2 md:left-0 md:right-0 md:h-[2px] h-full left-2 w-[2px]" />

          {timelineEvents.map((event, index) => (
            <div
              key={index}
              className={clsx(
                'relative flex sm:flex-col md:flex-col items-start md:items-center w-full md:w-auto',
                index % 2 === 0 ? 'md:-translate-y-[44px]' : 'md:translate-y-[44px]',
              )}
            >
              <div className="relative flex items-center md:flex-col md:items-center">
                <div className="w-4 h-4 bg-primary rounded-full z-10" />
                <div
                  className={clsx(
                    'absolute text-xs font-medium opacity-60',
                    'ml-6 md:ml-0 md:top-6 md:left-0 w-fit',
                  )}
                >
                  {event.date}
                </div>
              </div>

              <div
                className={clsx(
                  'shadow-md py-2 px-4 rounded-lg text-left md:text-center',
                  'flex-1 ml-14 md:ml-0 md:w-[200px]',
                )}
              >
                <CardTitle className="text-sm font-light">{event.title}</CardTitle>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
