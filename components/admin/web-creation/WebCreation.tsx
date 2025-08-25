'use client'

import { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { AiOutlineLoading } from 'react-icons/ai'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import posthog from 'posthog-js'
import * as z from 'zod'
import { useSession } from '@auth-client'
import { urlValidator } from '@helpers/form'
import { generateSlug } from '@helpers/utils'
import Faq from '@components/faq'
import RichTextEditor from '@components/rich-text-editor'
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
      'A Resilience Web is a digital mapping of environmental and social justice groups in a place, curated by people who live there. These webs are intended to help the discovery, collaboration and networking between activists and groups around issues that they care about.',
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
  title: z.string().min(1, 'Title is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .refine(urlValidator, {
      message: 'Please only use letters, numbers and dashes',
    })
    .refine((value) => value === value.toLowerCase(), {
      message: 'Slug must be lowercase',
    }),
  contactEmail: z.string().email('Please enter a valid email').optional(),
  description: z.string().optional(),
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

  const { watch, setValue } = form

  // Watch the title field to generate slug
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'title' && value.title) {
        setValue('slug', generateSlug(value.title))
      }
    })
    return () => subscription.unsubscribe()
  }, [watch, setValue])

  useEffect(() => {
    posthog.capture('web-creation-start')
  }, [])

  useEffect(() => {
    if (isSuccess) {
      router.push('/admin?firstTime=true')
    }
  }, [isSuccess, router])

  const onSubmit = useCallback(
    (data: FormValues) => {
      createWeb(data)
    },
    [createWeb],
  )

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-center">
        <Image alt="Resilience Web CIC logo" src={LogoImage} />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome 👋</h1>
        <p className="text-muted-foreground">
          You are taking the first steps in setting up a Resilience Web for your
          area, well done! Once you fill out the details below, you will be able
          to start adding listings, inviting collaborators to your team and so
          much more.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Web title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="text-sm shadow-xs"
                        placeholder="e.g. York"
                      />
                    </FormControl>
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
