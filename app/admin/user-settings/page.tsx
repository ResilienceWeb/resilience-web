'use client'

import { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { AiOutlineLoading } from 'react-icons/ai'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import * as z from 'zod'
import { PROTOCOL, REMOTE_HOSTNAME } from '@helpers/config'
import { Button } from '@components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui/card'
import { Checkbox } from '@components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/ui/form'
import { Input } from '@components/ui/input'
import { Spinner } from '@components/ui/spinner'
import useMyOwnerships from '@hooks/ownership/useMyOwnerships'
import usePermissions from '@hooks/permissions/usePermissions'
import useCurrentUser from '@hooks/user/useCurrentUser'
import useUpdateUser from '@hooks/user/useUpdateUser'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  subscribed: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

export default function UserSettingsPage() {
  const { updateUser, isPending, isSuccess } = useUpdateUser()
  const { status: sessionStatus } = useSession()
  const { user } = useCurrentUser()
  const { ownerships, isPending: isLoadingOwnerships } = useMyOwnerships()
  const { permissions, isPending: isLoadingPermissions } = usePermissions()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name ?? '',
      subscribed: user?.subscribed ?? false,
    },
  })

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name ?? '',
        subscribed: user.subscribed ?? false,
      })
    }
  }, [user, form])

  useEffect(() => {
    if (isSuccess) {
      toast.success('User settings updated successfully')
    }
  }, [isSuccess])

  const onSubmit = useCallback(
    (data: FormValues) => {
      updateUser({ name: data.name, subscribed: data.subscribed })
    },
    [updateUser],
  )

  if (!user || sessionStatus === 'loading') {
    return <Spinner />
  }

  return (
    <div className="flex flex-col gap-4 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>User settings</CardTitle>
        </CardHeader>
        <CardContent className="max-w-md">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col items-start gap-6"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-sm font-semibold">
                      Your name
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className="text-sm shadow-xs" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subscribed"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="subscribed-checkbox"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <label
                              htmlFor="subscribed-checkbox"
                              className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              Subscribed to the Resilience Web mailing list
                            </label>
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          Check the box if you'd like to receive our newsletter
                          with news, platform updates and more. You can
                          unsubscribe anytime.
                        </p>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={
                  !form.formState.isDirty || form.formState.isSubmitting
                }
              >
                {isPending && <AiOutlineLoading className="animate-spin" />}{' '}
                Update
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Webs</CardTitle>
          <CardDescription>Webs you can access and manage</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingOwnerships || isLoadingPermissions ? (
            <Spinner />
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-md mb-3 font-semibold">Owner of</h3>
                {ownerships && ownerships.length > 0 ? (
                  <ul className="flex flex-col gap-2">
                    {ownerships.map((web) => (
                      <li
                        key={web.id}
                        className="flex items-center justify-between pb-2"
                      >
                        <div className="flex-1">
                          <p>{web.title}</p>
                        </div>
                        <Link
                          href={`${PROTOCOL}://${web.slug}.${REMOTE_HOSTNAME}`}
                          target="_blank"
                        >
                          <Button variant="outline">View</Button>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">
                    You are not an owner of any webs yet.
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-md mt-4 mb-3 font-semibold">Editor of</h3>
                {permissions?.fullPermissionData?.webs &&
                permissions.fullPermissionData.webs.length > 0 ? (
                  <ul className="flex flex-col gap-2">
                    {permissions.fullPermissionData.webs.map((web) => (
                      <li
                        key={web.id}
                        className="flex items-center justify-between pb-2"
                      >
                        <div className="flex-1">
                          <p>{web.title}</p>
                        </div>
                        <Link
                          href={`${PROTOCOL}://${web.slug}.${REMOTE_HOSTNAME}`}
                          className="text-sm text-blue-600 hover:underline"
                          target="_blank"
                        >
                          View
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">
                    You don't have edit permissions for any webs.
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
