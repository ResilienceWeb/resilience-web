'use client'

import { memo, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { ReCaptchaProvider, useReCaptcha } from 'next-recaptcha-v3'
import { toast } from 'sonner'
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

type FormValues = {
  email: string
  web?: string
  message: string
}

const EMAIL_PATTERN =
  /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/

const EMAIL_RULES = {
  required: 'Email is required',
  pattern: { value: EMAIL_PATTERN, message: 'Invalid email address' },
}

const MESSAGE_RULES = {
  required: 'Message is required',
  maxLength: {
    value: 1000,
    message: 'Message must be less than 1000 characters',
  },
}

interface ContactDialogProps {
  isOpen: boolean
  onClose: () => void
  userEmail?: string
  webName?: string
}

const ContactDialogForm = ({
  isOpen,
  onClose,
  userEmail,
  webName,
}: ContactDialogProps) => {
  const { executeRecaptcha } = useReCaptcha()
  const form = useForm<FormValues>({
    defaultValues: {
      email: userEmail || '',
      web: webName || '',
      message: '',
    },
  })

  useEffect(() => {
    if (userEmail && !form.getValues('email')) {
      form.setValue('email', userEmail, { shouldDirty: false })
    }
  }, [userEmail, form])

  useEffect(() => {
    if (webName && !form.formState.dirtyFields.web) {
      form.setValue('web', webName, { shouldDirty: false })
    }
  }, [webName, form])

  const onFormSubmit = useCallback(
    async (data: FormValues) => {
      try {
        const recaptchaToken = await executeRecaptcha('contact_form')

        const response = await fetch(`${REMOTE_URL}/api/contact`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json;charset=utf-8',
          },
          body: JSON.stringify({ ...data, recaptchaToken }),
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
        toast.error("Couldn't send your message", {
          description:
            error instanceof Error && error.message
              ? error.message
              : 'Please try again, or email us directly at info@resilienceweb.org.uk.',
          duration: 5000,
        })
      }
    },
    [form, onClose, executeRecaptcha],
  )

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Contact the Resilience Web team</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Use this form to send feedback or questions to the team behind the
          Resilience Web platform.
        </DialogDescription>
        {/* webName is only set in the admin dashboard, where the sender is a
            web team member and this mis-send warning is just noise */}
        {!webName && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Trying to reach a group or organisation listed on a web? This form
            won't reach them — please use the website and social media links on
            their listing page instead.
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onFormSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="email"
              rules={EMAIL_RULES}
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
              rules={MESSAGE_RULES}
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
                className="bg-primary hover:bg-primary/90"
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

const ContactDialog = (props: ContactDialogProps) => (
  <ReCaptchaProvider>
    <ContactDialogForm {...props} />
  </ReCaptchaProvider>
)

export default memo(ContactDialog)
