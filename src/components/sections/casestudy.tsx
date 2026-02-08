import { CheckCircle2 } from 'lucide-react'
import { FaFacebook, FaLinkedin, FaTwitter } from 'react-icons/fa'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'

const Casestudy = () => {
  return (
    <section className="py-6 w-full max-w-[1480px] px-4 mx-auto">
      <div className="container">
        <div className="mx-auto flex max-w-prose flex-col items-center justify-between gap-10 lg:max-w-none lg:flex-row">
          <div>
            <h1 className="mt-10 text-5xl font-light tracking-tight lg:text-7xl">
              How this tool helps teams achieve efficient workflows
            </h1>
            <div className="mt-16">
              <p className="font-medium">Featuring insights from:</p>
              <div className="mt-4 flex items-center gap-4">
                <Avatar className="size-16 rounded-xl border">
                  <AvatarImage
                    src="https://shadcnblocks.com/images/block/avatar-1.webp"
                    alt="avatar"
                  />
                </Avatar>
                <div className="flex flex-col">
                  <p className="font-semibold">Jane Doe</p>
                  <p className="text-muted-foreground">
                    Senior Product Manager
                  </p>
                </div>
              </div>
            </div>
          </div>
          <Image
            src="https://shadcnblocks.com/images/block/placeholder-1.svg"
            alt="placeholder"
            className="max-h-[524px] w-full rounded-xl object-cover lg:w-auto"
            width={100}
            height={100}
          />
        </div>

        <div className="relative mt-20 flex flex-col gap-x-6 gap-y-16 lg:flex-row">
          <aside className="mx-auto h-fit max-w-prose lg:sticky lg:top-10 lg:mx-0 lg:w-64 lg:max-w-none">
            <Image
              src="https://shadcnblocks.com/images/block/logos/shadcn-ui-wordmark.svg"
              alt="logo"
              className="h-8"
              width={100}
              height={100}
            />
            <div className="mt-6 grid grid-cols-2 gap-5 lg:grid-cols-1">
              <div className="col-span-2 lg:col-span-1">
                <h2 className="font-semibold">Overview</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  A modern platform designed to simplify workflows, automate
                  processes, and drive innovation at scale.
                </p>
              </div>
              <div>
                <h2 className="font-semibold">Sector</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Technology; Automation
                </p>
              </div>
              <div>
                <h2 className="font-semibold">Team size</h2>
                <p className="mt-1 text-sm text-muted-foreground">10-100</p>
              </div>
              <div>
                <h2 className="font-semibold">Location</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  San Francisco, California
                </p>
              </div>
              <div>
                <h2 className="font-semibold">Established</h2>
                <p className="mt-1 text-sm text-muted-foreground">2020</p>
              </div>
              <div>
                <h2 className="font-semibold">Funding</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  $25m (Series A)
                </p>
              </div>
              <div>
                <h2 className="font-semibold">Core features</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Dashboards Tools API integration
                </p>
              </div>
            </div>
            <div className="mt-10 flex flex-col">
              <span className="mb-2 text-sm text-muted-foreground">
                Share this content:
              </span>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary"
                >
                  <FaLinkedin className="size-5" />
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary"
                >
                  <FaTwitter className="size-5" />
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary"
                >
                  <FaFacebook className="size-5" />
                </a>
              </div>
            </div>
          </aside>

          <div className="flex">
            <div className="mx-auto max-w-prose lg:max-w-4xl lg:px-20">
              <div className="grid gap-x-10 gap-y-7 rounded-3xl border p-6 lg:grid-cols-2 lg:gap-y-10 lg:border-none lg:p-0">
                <div>
                  <h2 className="text-xl font-semibold">Problem</h2>
                  <p className="mt-3 text-muted-foreground">
                    The team faced difficulties aligning their growth strategy
                    with a rigid data model, causing inefficiencies and limited
                    access to essential customer insights.
                  </p>
                </div>
                <Separator className="w-full lg:hidden" />
                <div>
                  <h2 className="text-xl font-semibold">Approach</h2>
                  <p className="mt-3 text-muted-foreground">
                    Adopted a flexible platform as the central hub for data,
                    enabling the creation of impactful workflows to drive
                    growth.
                  </p>
                </div>
                <div className="border-t pt-10 lg:col-span-2">
                  <h2 className="text-xl font-semibold">Outcomes</h2>
                  <ul className="mt-3 grid gap-x-10 gap-y-3 lg:grid-cols-2">
                    <li className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
                      <p className="font-semibold">
                        A streamlined system that accelerates their growth
                        initiatives
                      </p>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
                      <p className="font-semibold">
                        A customizable CRM that mirrors their data and
                        integrates seamlessly with their tools
                      </p>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
                      <p className="font-semibold">
                        A scalable, collaborative solution that grows alongside
                        their business
                      </p>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Narrative sections with anchors */}
              <div className="mt-20">
                {[1, 2, 3, 4].map((num) => (
                  <section
                    key={num}
                    id={`section${num}`}
                    className="prose mb-8"
                  >
                    <h2>{`Section ${num} Heading`}</h2>
                    <p>Section {num} content goes here...</p>
                  </section>
                ))}
              </div>
            </div>
          </div>

          <aside className="mx-auto h-fit max-w-prose lg:sticky lg:top-10 lg:mx-0 lg:w-64 lg:max-w-none">
            <Image
              src="https://shadcnblocks.com/images/block/logos/shadcn-ui-wordmark.svg"
              alt="logo"
              className="h-8"
              width={100}
              height={100}
            />
            <div className="mt-6 grid grid-cols-2 gap-5 lg:grid-cols-1">
              <div className="col-span-2 lg:col-span-1">
                <h2 className="font-semibold">On This Page</h2>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

export default Casestudy
