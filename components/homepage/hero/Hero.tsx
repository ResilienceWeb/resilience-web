export default function Hero() {
  return (
    <div className="relative w-full">
      <div className="mx-auto max-w-7xl px-1 py-2">
        <div className="flex flex-col items-center gap-8 md:gap-12">
          <div className="items-left animate-fade-in flex flex-col gap-6 md:items-center md:gap-8">
            <h1 className="w-full text-left text-4xl leading-tight font-bold tracking-tight break-words md:w-[90%] md:text-center md:text-6xl lg:w-[80%]">
              <span>Empowering place-based community </span>
              <span className="relative z-10 inline-block w-fit text-left leading-tight font-bold break-words after:absolute after:bottom-[1px] after:left-0 after:z-[-1] after:h-[25%] after:w-full after:bg-[#3A8159]/30 after:transition-all after:duration-300 hover:after:h-[40%] md:text-center">
                action
              </span>
            </h1>
            <p className="max-w-2xl text-left text-lg break-words text-gray-600 md:text-center md:text-xl">
              A Resilience Web is a holistic visualisation of environmental and
              social justice groups in a place, curated by people who live
              there.
            </p>
            <p className="max-w-2xl text-lg text-gray-600 md:text-center md:text-xl">
              These webs help foster discovery, collaboration and networking
              between activists and groups around issues they care about.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
