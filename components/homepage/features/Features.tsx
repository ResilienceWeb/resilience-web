import Link from 'next/link'
import { Map, Users, PenLine, Megaphone } from 'lucide-react'
import { Button } from '@components/ui/button'

const features = [
  {
    icon: Map,
    title: 'Start a Web for Your Area',
    description:
      'Create a web and shine a light on the groups driving positive change.',
  },
  {
    icon: Users,
    title: 'Invite Your Team',
    description: 'Invite others to co-manage your web and share the load.',
  },
  {
    icon: PenLine,
    title: 'Add & Edit Listings',
    description: 'Keep your web alive and accurate.',
  },
  {
    icon: Megaphone,
    title: 'Community-Powered',
    description:
      'Anyone can propose new listings or edits — just like Wikipedia!',
  },
]

export default function Features() {
  return (
    <div className="relative w-full py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center gap-10">
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              Build a Web of Local Resilience
            </h2>
            <p className="max-w-3xl text-lg text-gray-600">
              Discover and connect with the people making a difference near you.
              Here's some of what you can do:
            </p>
          </div>

          <ol className="grid w-full gap-x-10 gap-y-8 md:grid-cols-2">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <li key={index} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>

          <div className="mt-2 text-center">
            <p className="text-2xl font-semibold text-gray-900">
              Start your web today — it only takes a minute
            </p>
            <Link href="/auth/signup">
              <Button size="lg" className="mt-3">
                Create new web
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
