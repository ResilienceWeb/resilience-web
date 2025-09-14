'use client'

import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { AiOutlineLoading } from 'react-icons/ai'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAppContext } from '@store/hooks'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as z from 'zod'
import { REMOTE_URL } from '@helpers/config'
import WebAccessTable from '@components/admin/web-access-table'
import Faq from '@components/faq'
import { Button } from '@components/ui/button'
import { Checkbox } from '@components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@components/ui/form'
import { Input } from '@components/ui/input'
import { Spinner } from '@components/ui/spinner'
import useIsOwnerOfWeb from '@hooks/web-access/useIsOwnerOfWeb'
import useWebAccessForWeb from '@hooks/web-access/useWebAccessForWeb'
import useSelectedWebName from '@hooks/webs/useSelectedWebName'

const faqs = [
  {
    question: 'What is the difference between an editor and an owner?',
    answer:
      'An editor can add and edit listings, categories and tags. An owner can do that but also invite new editors to the web.',
  },
  {
    question: 'Why can I not remove someone from my team?',
    answer:
      'It is not possible to remove an owner from your team. If however they would like to leave the team, please get in touch with us and we will remove them for you.',
  },
]

const formSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  listings: z.array(z.string()),
  asOwner: z.boolean().default(false),
})

type FormValues = z.infer<typeof formSchema>

export default function TeamPage() {
  const queryClient = useQueryClient()
  const { isOwner } = useIsOwnerOfWeb()
  const selectedWebName = useSelectedWebName()
  const { selectedWebId } = useAppContext()
  const { webAccess, isPending: isWebAccessPending } = useWebAccessForWeb()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
    defaultValues: {
      email: '',
      listings: [],
      asOwner: false,
    },
  })

  const sendInvite = useCallback(
    async (data: FormValues) => {
      try {
        const body = {
          email: data.email,
          web: selectedWebId,
          asOwner: data.asOwner,
        }

        const response = await fetch(`${REMOTE_URL}/api/users/invite`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json;charset=utf-8',
          },
          body: JSON.stringify(body),
        })

        if (response.status === 200) {
          toast.success('Success', {
            description: `Invite sent to ${data.email}`,
            duration: 5000,
          })
          form.reset()
          queryClient.invalidateQueries({ queryKey: ['web-access-for-web'] })
        } else {
          throw new Error('Failed to send invite')
        }
      } catch (error) {
        toast.error('Error', {
          description:
            'There was an error. Please try again or contact the developers.',
          duration: 5000,
        })
      }
    },
    [selectedWebId, form, queryClient],
  )

  if (isWebAccessPending || !selectedWebId) {
    return <Spinner />
  }

  return (
    <div className="flex flex-col divide-y divide-gray-200">
      {isOwner && (
        <div className="pb-8">
          <h1 className="mb-6 text-2xl font-bold">Invite team member</h1>
          <div className="overflow-hidden rounded-md bg-white p-4 shadow-xs">
            <div className="max-w-[450px]">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(sendInvite)}
                  className="flex flex-col items-start gap-4"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" className="bg-white" />
                        </FormControl>
                        <FormDescription>
                          The invited user will have the permission to add/edit
                          listings, categories and tags.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="asOwner"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center gap-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Invite as an owner
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="bg-[#2B8257] hover:bg-[#236c47]"
                    disabled={
                      !form.formState.isValid || form.formState.isSubmitting
                    }
                  >
                    {form.formState.isSubmitting && (
                      <AiOutlineLoading className="animate-spin" />
                    )}{' '}
                    Send invite
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      )}

      {webAccess.length > 0 && (
        <div className="pt-4">
          <h2 className="text-2xl font-bold">Team</h2>
          <p className="mb-4">
            People who can add and edit listings on the{' '}
            <span className="font-semibold">{selectedWebName}</span> web.
          </p>
          <WebAccessTable
            webAccess={webAccess}
            isOwner={isOwner}
            webId={selectedWebId}
          />
        </div>
      )}

      <div className="mb-8! pt-8">
        <h3 className="mb-4 text-2xl font-bold">FAQs</h3>
        <Faq content={faqs} />
      </div>
    </div>
  )
}
