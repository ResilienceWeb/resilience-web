'use client'

import { memo, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Textarea } from '@components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@components/ui/form'

import { REMOTE_URL } from '@helpers/config'

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
}

const FeedbackDialog = ({ isOpen, onClose }: FeedbackDialogProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
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
          <DialogTitle>Feedback</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Use this form to send us feedback or any questions you may have 😊
        </DialogDescription>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onFormSubmit)}
            className="space-y-4"
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
                  <FormLabel className="font-semibold">Feedback</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="h-[200px]"
                      placeholder="Enter your feedback"
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
                Send feedback
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default memo(FeedbackDialog)
