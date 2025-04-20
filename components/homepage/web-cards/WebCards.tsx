import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'

import { PROTOCOL, REMOTE_HOSTNAME } from '@helpers/config'

// Hardcoded array to determine which webs are displayed last
const lastOnesOnHomepage = [
  'Anglia Ruskin University',
  'University of Cambridge',
]

// Function to check if a web was created less than 4 months ago
const isNewWeb = (createdAt) => {
  if (!createdAt) return false

  const creationDate = new Date(createdAt)
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 4)

  return creationDate > oneMonthAgo
}

const WebCards = ({ webs }) => {
  return (
    <div className="mx-auto max-w-7xl px-1 py-8" id="web-cards">
      <h2 className="mb-6 text-center text-4xl font-bold tracking-tight text-gray-900">
        Find Resilience Webs near you in the UK
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {webs
          ?.filter(
            (web) =>
              Boolean(web.image) &&
              web.slug !== 'ctrlshift' &&
              web.slug !== 'transition-uk',
          )
          .sort((a, b) => {
            if (
              lastOnesOnHomepage.includes(a.title) >
              lastOnesOnHomepage.includes(b.title)
            ) {
              return 1
            } else {
              return -1
            }
          })
          .sort((a, b) => {
            if (isNewWeb(a.createdAt) > isNewWeb(b.createdAt)) {
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
  const isNew = isNewWeb(web.createdAt)

  return (
    <Link href={`${PROTOCOL}://${web.slug}.${REMOTE_HOSTNAME}`}>
      <div className="group relative h-full overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        {isNew && (
          <Badge className="absolute top-2 right-2 z-10 bg-green-500 hover:bg-green-600">
            New
          </Badge>
        )}
        <div className="relative h-48 overflow-hidden">
          <Image
            alt={`Image representing ${web.title} web`}
            src={web.image}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h3 className="text-xl font-semibold text-gray-900">{web.title}</h3>
        </div>
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
      onClick={handleClick}
      className="group flex h-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-[#3A8159] hover:shadow-xl"
    >
      <div className="rounded-full bg-green-50 p-4">
        <svg
          className="h-8 w-8 text-[#3A8159]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </div>
      <p className="mb-2 text-gray-600">Start mapping your local community</p>
      <Button>Create new web</Button>
    </div>
  )
}
