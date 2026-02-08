type CapabilityItem = { title?: string | null; description?: string | null }

export default function Capabilities({
  items = [],
}: {
  items?: CapabilityItem[] | null
}) {
  const capabilities = items?.filter((item) => item?.title) ?? []

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 px-0 -mb-20 lg:-mb-0">
      {capabilities.map((capability, index) => (
        <div
          key={index}
          className="border border-muted w-full rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300 pb-8 sm:pb-12"
        >
          <h3 className="text-base md:text-lg font-semibold mb-2">{capability.title}</h3>
          <p className="opacity-60 text-xs md:text-sm">{capability.description}</p>
        </div>
      ))}
    </div>
  )
}
