export default function Hero() {
  return (
    <div className="mt-4 w-full max-w-7xl px-4">
      <div className="flex flex-col items-center gap-8 py-0 md:flex-row md:gap-4 md:py-4">
        <div className="items-left flex flex-col gap-5 md:items-center md:gap-8">
          <h1 className="w-full break-words text-left text-[42px] font-semibold leading-tight md:w-[90%] md:text-center md:text-[52px] lg:w-[70%]">
            <span>Empowering place-based community </span>
            <span className="relative z-10 inline-block w-fit break-words text-left text-[42px] font-semibold leading-tight after:absolute after:bottom-[1px] after:left-0 after:z-[-1] after:h-[25%] after:w-full after:bg-[#3A8159] md:text-center md:text-[52px]">
              action
            </span>
          </h1>
          <p className="max-w-3xl break-words text-left text-lg text-gray-700 md:text-center">
            A Resilience Web is a holistic visualisation of environmental and
            social justice groups in a place, curated by people who live there.
            These webs are intended to help the discovery, collaboration and
            networking between activists and groups around issues that they care
            about.
          </p>
          <p className="max-w-3xl text-lg text-gray-700">
            Be part of a growing movement of positive change...
          </p>
        </div>
      </div>
    </div>
  )
}
