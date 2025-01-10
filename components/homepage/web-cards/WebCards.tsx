import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@components/ui/button'

import { PROTOCOL, REMOTE_HOSTNAME } from '@helpers/config'

// Hardcoded array to determine which webs are displayed first
const orderOnHomepage = ['Cambridge', 'York', 'Norwich', 'Durham']

const WebCards = ({ webs }) => {
  return (
    <div className="max-w-7xl" id="web-cards">
      <h2 className="my-4 text-3xl font-semibold">
        Find Resilience Webs near you in the UK
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {webs
          ?.filter(
            (web) =>
              Boolean(web.image) &&
              web.slug !== 'ctrlshift' &&
              web.slug !== 'transition-uk',
          )
          .sort((a, b) => {
            if (
              orderOnHomepage.includes(a.title) >
              orderOnHomepage.includes(b.title)
            ) {
              return -1
            } else {
              return 1
            }
          })
          .map((web) => <Card key={web.id} web={web} />)}

        <CreateNewWebCard />
      </div>
    </div>
  )
}

export default WebCards

const Card = ({ web }) => {
  return (
    <Link href={`${PROTOCOL}://${web.slug}.${REMOTE_HOSTNAME}`}>
      <div className="w-full overflow-hidden rounded-md bg-white p-4 shadow-md transition-shadow duration-300 ease-in-out hover:shadow-2xl">
        <div className="relative -mx-6 -mt-4 mb-4 h-[210px] bg-gray-100">
          <Image
            alt={`Image representing ${web.title} web`}
            src={web.image}
            fill={true}
            sizes="(max-width: 768px) 90vw, 400px"
            className="object-cover object-bottom"
          />
        </div>
        <h2 className="text-2xl text-gray-700">{web.title}</h2>
      </div>
    </Link>
  )
}

const CreateNewWebCard = () => {
  const router = useRouter()

  const handleClick = () => {
    router.push('/auth/signup')
  }

  return (
    <div
      className="flex h-full w-full items-center justify-center overflow-hidden rounded-md bg-[#defce2] p-4 shadow-md transition-shadow duration-300 ease-in-out hover:shadow-2xl"
      onClick={handleClick}
    >
      <div className="stack-l stack-l_space-2">
        <h2 className="text-2xl">Put your place here</h2>
        <p className="text-sm">Click here to create a web for your area</p>
        <Button>Create new web</Button>
      </div>
    </div>
  )
}
