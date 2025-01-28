'use client'

import { useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Spinner } from '@components/ui/spinner'
import { Button } from '@components/ui/button'
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
import PermissionsTable from '@components/admin/permissions-table'
import { REMOTE_URL } from '@helpers/config'
import usePermissions from '@hooks/permissions/usePermissions'
import usePermissionsForCurrentWeb from '@hooks/permissions/usePermissionsForCurrentWeb'
import useIsOwnerOfCurrentWeb from '@hooks/ownership/useIsOwnerOfCurrentWeb'
import useOwnerships from '@hooks/ownership/useOwnerships'
import useSelectedWebName from '@hooks/webs/useSelectedWebName'
import { useAppContext } from '@store/hooks'
import Faq from '@components/faq'

const faqs = [
  {
    question: 'What is the difference between an editor and an owner?',
    answer:
      'An editor can add and edit listings, categories and tags. An owner can also invite new editors to the web.',
  },
]

const formSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  listings: z.array(z.string()),
})

type FormValues = z.infer<typeof formSchema>

export default function TeamPage() {
  const { data: session } = useSession()
  const isOwnerOfCurrentWeb = useIsOwnerOfCurrentWeb()
  const { isPending: isPermissionsPending } = usePermissions()
  const { data: permissionsForCurrentWeb } = usePermissionsForCurrentWeb()
  const { ownerships } = useOwnerships()
  const selectedWebName = useSelectedWebName()
  const { selectedWebId } = useAppContext()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      listings: [],
    },
  })

  const decoratedOwnerships = useMemo(() => {
    if (!ownerships) {
      return []
    }

    return ownerships
      .filter((ownership) => !ownership.user.admin)
      .map((ownership) => ({ ...ownership, owner: true }))
  }, [ownerships])

  const permissionsForCurrentWebWithoutOwners = useMemo(() => {
    const filteredPermissions = []
    const ownershipsEmails = ownerships?.map((o) => o.user.email)
    permissionsForCurrentWeb?.map((permission) => {
      if (!ownershipsEmails?.includes(permission.user.email)) {
        // @ts-ignore
        filteredPermissions.push(permission)
      }
    })

    return filteredPermissions
  }, [ownerships, permissionsForCurrentWeb])

  const sendInvite = useCallback(
    async (data: FormValues) => {
      try {
        const body = {
          email: data.email,
          web: selectedWebId,
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
    [selectedWebId, form],
  )

  if (isPermissionsPending) {
    return <Spinner />
  }

  return (
    <div className="flex flex-col space-y-8 divide-y divide-gray-200">
      {(isOwnerOfCurrentWeb || session.user.admin) && (
        <div className="pb-8">
          <h1 className="mb-6 text-2xl font-bold">Invite team member</h1>
          <div className="overflow-hidden rounded-md bg-white p-4 shadow-sm">
            <div className="max-w-[450px]">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(sendInvite)}
                  className="space-y-4"
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

                  <Button
                    type="submit"
                    className="bg-[#2B8257] hover:bg-[#236c47]"
                    disabled={
                      !form.formState.isValid || form.formState.isSubmitting
                    }
                  >
                    Send invite
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      )}

      {(permissionsForCurrentWeb?.length > 0 ||
        decoratedOwnerships?.length > 0 ||
        session.user.admin) && (
        <div className="pt-8">
          <h2 className="text-2xl font-bold">Team</h2>
          <p className="mb-4">
            List of people who have permissions to add and edit listings on the{' '}
            <span className="font-semibold">{selectedWebName}</span> web.
          </p>
          <PermissionsTable
            permissions={[
              ...decoratedOwnerships,
              ...permissionsForCurrentWebWithoutOwners,
            ]}
          />
        </div>
      )}

      <div className="mb-12 pt-8">
        <h3 className="mb-4 text-2xl font-bold">FAQs</h3>
        <Faq content={faqs} />
      </div>
    </div>
  )
}
