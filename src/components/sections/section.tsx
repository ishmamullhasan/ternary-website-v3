'use client'

export default function Section({
  id,
  title,
  description,
  children,
}: {
  id: string
  label?: string | null
  title?: string | null
  description?: string | null
  children: React.ReactNode
}) {
  return (
    <section id={id} className="px-10 flex flex-col gap-10 mt-8 mb-16">
      <div className="flex flex-col gap-3 max-w-[960px]">
        {/* {label && <Badge className="w-fit" variant="secondary">{label}</Badge>} */}
        <h2 className="scroll-m-20 text-3xl font-light tracking-tight lg:text-4xl max-w-[1080px]">
          {title}
        </h2>
        {description && <p className="opacity-65">{description}</p>}
      </div>
      {children}
    </section>
  )
}
