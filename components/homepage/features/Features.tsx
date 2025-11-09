import { useRouter } from 'next/navigation'
import posthog from 'posthog-js'
import { Button } from '@components/ui/button'

export default function Features() {
  const router = useRouter()

  const handleClick = () => {
    posthog.capture('create-new-web-click')
    router.push('/auth/signup')
  }

  return (
    <div className="relative w-full py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center gap-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              🌿 Build a Web of Local Resilience
            </h2>
            <p className="max-w-3xl text-lg text-gray-600 md:text-lg">
              Discover and connect with the people making a difference near you.
              Here's some of what you can do on Resilience Web:
            </p>
          </div>

          <div className="grid w-full gap-6 md:grid-cols-4 md:gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-lg"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${feature.iconBg} text-3xl shadow-md`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-md font-bold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-700">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-2 text-center">
            <p className="text-2xl font-semibold text-gray-900">
              Start your web today — it only takes a minute
            </p>
            <Button size="lg" className="mt-2" onClick={handleClick}>
              Create new web
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

const features = [
  {
    icon: '🗺️',
    title: 'Start a Web for Your Area',
    description:
      'Create a web and shine a light on the groups driving positive change.',
    gradient: 'from-emerald-50 to-teal-50',
    iconBg: 'bg-emerald-100',
    accentColor: 'border-emerald-200',
  },
  {
    icon: '🤝',
    title: 'Invite Your Team',
    description: 'Invite others to co-manage your web and share the load.',
    gradient: 'from-purple-50 to-pink-50',
    iconBg: 'bg-purple-100',
    accentColor: 'border-purple-200',
  },
  {
    icon: '✏️',
    title: 'Add & Edit Listings',
    description: 'Keep your web alive and accurate.',
    gradient: 'from-blue-50 to-cyan-50',
    iconBg: 'bg-blue-100',
    accentColor: 'border-blue-200',
  },
  {
    icon: '💡',
    title: 'Community-Powered',
    description:
      'Anyone can propose new listings or edits — just like Wikipedia!',
    gradient: 'from-amber-50 to-orange-50',
    iconBg: 'bg-amber-100',
    accentColor: 'border-amber-200',
  },
]
