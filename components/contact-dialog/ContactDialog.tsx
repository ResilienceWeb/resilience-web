'use client'

import { memo, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import * as z from 'zod'
import { REMOTE_URL } from '@helpers/config'
import { Button } from '@components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@components/ui/dialog'
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
import { Textarea } from '@components/ui/textarea'

const formSchema = z.object({
  email: z
    .email({ error: 'Invalid email address' })
    .min(1, { error: 'Email is required' }),
  web: z.string().optional(),
  message: z
    .string()
    .min(1, { error: 'Message is required' })
    .max(1000, { error: 'Message must be less than 1000 characters' }),
})

interface ContactDialogProps {
  isOpen: boolean
  onClose: () => void
  userEmail?: string
}

const ContactDialog = ({
  isOpen,
  onClose,
  userEmail,
}: ContactDialogProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: userEmail || '',
      web: '',
      message: '',
    },
  })

  useEffect(() => {
    if (userEmail && !form.getValues('email')) {
      form.setValue('email', userEmail, { shouldDirty: false })
    }
  }, [userEmail, form])

  const onFormSubmit = useCallback(
    async (data: z.infer<typeof formSchema>) => {
      try {
        const response = await fetch(`${REMOTE_URL}/api/contact`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json;charset=utf-8',
          },
          body: JSON.stringify(data),
        })
        const result = await response.json()

        if (!result.error) {
          toast.success('Success', {
            description: 'Message sent! Thank you.',
            duration: 5000,
          })
          form.reset()
          onClose()
        } else {
          throw new Error(result.error)
        }
      } catch (error) {
        toast.error('Error', {
          description:
            'There was an error. Please try again or email directly at info@resilienceweb.org.uk',
          duration: 5000,
        })
      }
    },
    [form, onClose],
  )

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Get in touch</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Use this form to send us feedback or any questions you may have.
        </DialogDescription>
        <p className="text-sm text-muted-foreground italic">
          Note: This form contacts the Resilience Web platform team. If you have
          a question about a specific local web, please use the Contact info
          section in the side menu on that web's page instead.
        </p>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onFormSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="Enter your email"
                    />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.email?.message}
                  </FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="web"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Web</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Which web is this about? (optional)"
                    />
                  </FormControl>
                  <FormDescription>
                    If your message is about a specific web, let us know which
                    one.
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Message</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="h-50"
                      placeholder="Enter your message"
                    />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.message?.message}
                  </FormMessage>
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="bg-[#2B8257] hover:bg-[#236c47]"
              >
                Send message
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default memo(ContactDialog)
