'use client'

import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { AiOutlineLoading } from 'react-icons/ai'
import { PiInfoBold } from 'react-icons/pi'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import posthog from 'posthog-js'
import * as z from 'zod'
import { useSession } from '@auth-client'
import { scrollToFormError } from '@helpers/scrollToFormError'
import { generateSlug } from '@helpers/utils'
import Faq from '@components/faq'
import RichTextEditor from '@components/rich-text-editor'
import { Alert, AlertDescription, AlertTitle } from '@components/ui/alert'
import { Button } from '@components/ui/button'
import { Card, CardContent } from '@components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/ui/form'
import { Input } from '@components/ui/input'
import useCreateWeb from '@hooks/webs/useCreateWeb'
import LogoImage from '../../../public/logo.png'

const SetLocationMap = dynamic(
  () => import('@components/admin/set-location-map'),
  {
    ssr: false,
    loading: () => <div className="pt-5 text-center">Loading…</div>,
  },
)

const faqs = [
  {
    question: '🌱 What is a Resilience Web?',
    answer:
      'A Resilience Web is a digital mapping of environmental and social justice groups in a place, curated by people who live there. These webs are intended to help the discovery, collaboration and networking between activists and groups.',
  },
  {
    question: '🏘️ What is the difference between a web and a listing?',
    answer:
      'A web covers a whole place, like a city, town or village, and is run by a team of local volunteers. A listing is a single group or organisation on a web. If you want your group to appear on Resilience Web, propose a listing on the web for your area rather than creating a new web.',
  },
  {
    question: '💵 How much does it cost to use the platform?',
    answer: (
      <p className="text-muted-foreground">
        It's completely free! However we rely on grants, the hard work of
        volunteers and donations from people like you. If you can support the
        project with as little as £3/month we would be hugely grateful. Go to{' '}
        <a
          href="https://opencollective.com/resilience-web"
          className="text-primary hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          our Open Collective
        </a>{' '}
        to donate.
      </p>
    ),
  },
  {
    question: '❓ I have some questions',
    answer: (
      <p className="text-muted-foreground">
        Get in touch with us anytime via the button at the top right of the
        page. We are happy to set up a call to take you through what the
        platform can offer and listen to your feedback if you have any. You
        might also find the answer to your questions in{' '}
        <a
          href="https://knowledgebase.resilienceweb.org.uk"
          className="text-primary hover:underline"
        >
          our Knowledgebase
        </a>
        .
      </p>
    ),
  },
]

const formSchema = z.object({
  title: z.string().min(1, { error: 'Title is required' }),
  slug: z
    .string()
    .min(1, { error: 'Slug is required' })
    .regex(/^[a-z0-9-]+$/, {
      error: 'Only lowercase letters, numbers, and hyphens are allowed',
    }),
  contactEmail: z.email({ error: 'Please enter a valid email' }),
  description: z.string(),
  location: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
      description: z.string(),
    })
    .nullable()
    .optional(),
})

type FormValues = z.infer<typeof formSchema>

const WebCreation = () => {
  const session = useSession()
  const { createWeb, isPending, isSuccess, isError, errorMessage } =
    useCreateWeb()
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      slug: '',
      contactEmail: session?.data?.user?.email || '',
      description: '',
      location: null,
    },
  })

  const { setValue, control } = form

  const titleValue = useWatch({ control, name: 'title' })
  useEffect(() => {
    if (titleValue) {
      setValue('slug', generateSlug(titleValue))
    }
  }, [titleValue, setValue])

  useEffect(() => {
    if (session?.data?.user?.email) {
      setValue('contactEmail', session.data.user.email)
    }
  }, [session?.data?.user?.email, setValue])

  useEffect(() => {
    posthog.capture('web-creation-start')
  }, [])

  useEffect(() => {
    if (isSuccess) {
      router.push('/admin?firstTime=true')
    }
  }, [isSuccess, router])

  const onSubmit = (data: FormValues) => {
    createWeb(data)
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-center">
        <Image alt="Resilience Web CIC logo" src={LogoImage} />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Create a web for your area
        </h1>
        <p className="text-muted-foreground">
          A Resilience Web maps the environmental and social justice groups
          across a whole place, like a city, town or village. Once you fill out
          the details below, you will be able to start adding the groups in your
          area as listings, inviting collaborators to your team and so much
          more.
        </p>
      </div>

      {/* A static signpost, so it shouldn't be announced like an error. */}
      <Alert role="note">
        <PiInfoBold />
        <AlertTitle>Want to add your group or organisation?</AlertTitle>
        <AlertDescription>
          <p>
            You don't need to create a web. Find the web for your area and
            propose your group as a listing on it instead.{' '}
            <Link
              href="/#web-cards"
              onClick={() => posthog.capture('web-creation-find-web-click')}
              className="font-semibold underline"
            >
              Find your area's web
            </Link>
          </p>
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit, scrollToFormError)}
              className="flex flex-col gap-4"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Place name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="text-sm shadow-xs"
                        placeholder="e.g. York"
                      />
                    </FormControl>
                    <FormDescription>
                      The city, town or village this web covers, not the name of
                      a group.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem className="max-w-lg">
                    <FormLabel className="text-sm font-semibold">
                      Link to web
                    </FormLabel>
                    <FormControl>
                      <div className="flex rounded-md shadow-xs">
                        <Input
                          {...field}
                          className="rounded-r-none text-sm"
                          placeholder="e.g. york"
                          onChange={(e) => {
                            // Convert input to lowercase
                            field.onChange(e.target.value.toLowerCase())
                          }}
                        />
                        <span className="border-input bg-muted text-muted-foreground inline-flex items-center rounded-r-md border border-l-0 px-3 text-sm">
                          .resilienceweb.org.uk
                        </span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      This will form part of the link to your web, e.g.
                      york.resilienceweb.org.uk
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem className="max-w-lg">
                    <FormLabel className="text-sm font-semibold">
                      Contact email
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="text-sm shadow-xs"
                        placeholder="e.g. contact@example.com"
                        type="email"
                      />
                    </FormControl>
                    <FormDescription>
                      This should be an email address where people can reach you
                      with questions or feedback. We've prefilled it with your
                      email address but you can change it.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Description
                    </FormLabel>
                    <FormDescription>
                      This can be edited later. You can format the text in any
                      way you'd like, and you can even add images or embed
                      videos.
                    </FormDescription>
                    <FormControl>
                      <RichTextEditor name="description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel className="text-sm font-semibold">
                  Location
                </FormLabel>
                <FormDescription>
                  Add a location for your web. Start by writing your
                  city/village name in the Enter address field below.
                </FormDescription>
                <SetLocationMap
                  latitude={undefined}
                  longitude={undefined}
                  locationDescription={undefined}
                />
              </div>

              {isError && errorMessage && (
                <p className="text-destructive text-sm">{`${errorMessage}`}</p>
              )}

              <Button type="submit" disabled={isPending} className="self-start">
                {isPending && <AiOutlineLoading className="animate-spin" />} Get
                started
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-col gap-1">
        <h2 className="text-2xl font-bold">Need help?</h2>
        <Faq content={faqs} />
      </div>
    </div>
  )
}

export default WebCreation
