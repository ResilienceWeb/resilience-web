import { ArrowDown } from 'lucide-react'

interface HeroProps {
  webCount: number
}

export default function Hero({ webCount }: HeroProps) {
  return (
    <div className="relative w-full">
      <div className="mx-auto max-w-7xl px-4 pt-6 pb-2 md:pt-10">
        <div className="flex flex-col items-center gap-8 md:gap-10">
          <div className="items-left animate-fade-in flex flex-col gap-5 md:items-center md:gap-6">
            <h1 className="w-full max-w-[20ch] text-left text-4xl leading-[1.15] font-bold tracking-tight md:text-center md:text-5xl lg:text-6xl lg:leading-[1.1]">
              Empowering place-based community{' '}
              <span className="relative z-10 inline-block after:absolute after:bottom-px after:left-0 after:z-[-1] after:h-[25%] after:w-full after:bg-primary/30 after:transition-all after:duration-300 hover:after:h-[40%]">
                action
              </span>
            </h1>
            <p className="max-w-[58ch] text-left text-lg leading-relaxed text-gray-600 md:text-center md:text-xl">
              A Resilience Web is a holistic visualisation of environmental and
              social justice groups in a place, curated by people who live there.
              These webs help foster discovery, collaboration and networking
              between activists and groups.
            </p>
            <div className="flex items-center gap-3 text-sm text-gray-500 md:justify-center">
              <span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
              <span>
                {webCount} community webs active across the UK —{' '}
                <a
                  href="#web-cards"
                  className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
                >
                  explore them
                  <ArrowDown className="ml-1 inline h-3 w-3" />
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
