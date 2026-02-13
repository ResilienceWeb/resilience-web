import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import posthog from 'posthog-js'
import { getWebUrl } from '@helpers/config'
import { Badge } from '@components/ui/badge'
import { Button } from '@components/ui/button'

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
            const aIsLast = lastOnesOnHomepage.includes(a.title)
            const bIsLast = lastOnesOnHomepage.includes(b.title)
            return Number(aIsLast) - Number(bIsLast)
          })
          .sort((a, b) => {
            const aIsNew = isNewWeb(a.createdAt)
            const bIsNew = isNewWeb(b.createdAt)
            return Number(bIsNew) - Number(aIsNew)
          })
          .map((web) => (
            <Card key={web.id} web={web} />
          ))}

        <CreateNewWebCard />
      </div>
    </div>
  )
}

export default WebCards

const Card = ({ web }) => {
  const isNew = isNewWeb(web.createdAt)

  return (
    <Link href={getWebUrl(web.slug)}>
      <div className="group relative h-full overflow-hidden rounded-xl bg-white shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
        {isNew && (
          <Badge variant="secondary" className="absolute top-2 right-2 z-10">
            New
          </Badge>
        )}
        <div className="relative h-48 overflow-hidden">
          <Image
            alt={`Image representing ${web.title} web`}
            src={web.image}
            fill
            className="object-cover transition-transform duration-200 group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h3 className="text-xl font-semibold">{web.title}</h3>
        </div>
      </div>
    </Link>
  )
}

const CreateNewWebCard = () => {
  const router = useRouter()

  const handleClick = () => {
    posthog.capture('create-new-web-click')
    router.push('/auth/signup')
  }

  return (
    <div
      onClick={handleClick}
      className="group flex h-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white p-6 text-center transition-all duration-200 hover:-translate-y-1 hover:border-[#3A8159] hover:shadow-xl"
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
