'use client'

import { memo, useCallback } from 'react'
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
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  feedback: z
    .string()
    .min(1, 'Feedback is required')
    .max(1000, 'Feedback must be less than 1000 characters'),
})

interface FeedbackDialogProps {
  isOpen: boolean
  onClose: () => void
  userEmail?: string
}

const FeedbackDialog = ({
  isOpen,
  onClose,
  userEmail,
}: FeedbackDialogProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: userEmail || '',
      feedback: '',
    },
  })

  const onFormSubmit = useCallback(
    async (data: z.infer<typeof formSchema>) => {
      try {
        const response = await fetch(`${REMOTE_URL}/api/feedback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json;charset=utf-8',
          },
          body: JSON.stringify(data),
        })
        const result = await response.json()

        if (!result.error) {
          toast.success('Success', {
            description: 'Feedback sent! Thank you.',
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
          Use this form to send us feedback or any questions you may have 😊
        </DialogDescription>

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
                  <FormDescription>
                    So we know how to reply to you
                  </FormDescription>
                  <FormMessage>
                    {form.formState.errors.email?.message}
                  </FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Message</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="h-[200px]"
                      placeholder="Enter your message"
                    />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.feedback?.message}
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

export default memo(FeedbackDialog)
