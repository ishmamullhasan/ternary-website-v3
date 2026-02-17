import Capabilities from '@/components/sections/capabilities'

interface CapabilitiesCompProps {
  heading?: string | null
  description?: string | null
  items?: { title?: string | null; description?: string | null }[] | null
}

export default function CapabilitiesComp({
  heading,
  description,
  items = [],
}: CapabilitiesCompProps) {
  return (
    <div className="flex flex-col justify-center items-center relative lg:max-w-7xl w-full mx-auto my-10 lg:pt-10 md:pt-10 pt-10 lg:p-10 md:p-8 p-4">
      <h1 className="px-6 md:px-10 scroll-m-20 text-3xl md:text-4xl lg:text-5xl font-light tracking-tight max-w-[90%] md:max-w-[800px]">
        {heading}
      </h1>

      <p className="text-[16px] lg:w-[1055px] text-center">{description}</p>

      <div className="mt-10 w-full">
        <Capabilities items={items} />
      </div>
    </div>
  )
}
