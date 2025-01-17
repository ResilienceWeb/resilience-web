'use client'
import { useCallback, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AiOutlineLoading } from 'react-icons/ai'
import * as z from 'zod'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { Button } from '@components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/ui/form'
import { Input } from '@components/ui/input'
import { Checkbox } from '@components/ui/checkbox'
import { Spinner } from '@components/ui/spinner'
import useUpdateUser from '@hooks/user/useUpdateUser'
import useCurrentUser from '@hooks/user/useCurrentUser'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  subscribed: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

export default function UserSettingsPage() {
  const { updateUser, isPending, isSuccess } = useUpdateUser()
  const { status: sessionStatus } = useSession()
  const { user } = useCurrentUser()

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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User settings</CardTitle>
        </CardHeader>
        <CardContent className="max-w-md">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Your name
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className="text-sm shadow-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subscribed"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormControl>
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <label
                            htmlFor={field.name}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Subscribed to the Resilience Web mailing list
                          </label>
                        </div>
                        <p className="text-sm text-muted-foreground">
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
                disabled={!form.formState.isDirty || !form.formState.isValid}
              >
                {isPending && <AiOutlineLoading className="animate-spin" />}{' '}
                Update
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
