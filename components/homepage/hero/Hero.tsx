import { ArrowDown } from 'lucide-react'

interface HeroProps {
  webCount: number
}

export default function Hero({ webCount }: HeroProps) {
  return (
    <div className="relative w-full">
      <div className="mx-auto max-w-7xl px-4 py-2">
        <div className="flex flex-col items-center gap-8 md:gap-12">
          <div className="items-left animate-fade-in flex flex-col gap-6 md:items-center md:gap-8">
            <h1 className="w-full text-left text-4xl leading-tight font-bold tracking-tight wrap-break-word md:w-[90%] md:text-center md:text-6xl lg:w-[80%]">
              <span>Empowering place-based community </span>
              <span className="relative z-10 inline-block w-fit text-left leading-tight font-bold wrap-break-word after:absolute after:bottom-px after:left-0 after:z-[-1] after:h-[25%] after:w-full after:bg-primary/30 after:transition-all after:duration-300 hover:after:h-[40%] md:text-center">
                action
              </span>
            </h1>
            <p className="max-w-2xl text-left text-lg wrap-break-word text-gray-600 md:text-center md:text-xl">
              A Resilience Web is a holistic visualisation of environmental and
              social justice groups in a place, curated by people who live
              there.
            </p>
            <p className="max-w-2xl text-lg text-gray-600 md:text-center md:text-xl">
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
