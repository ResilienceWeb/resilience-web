import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useReCaptcha } from 'next-recaptcha-v3'
import { z } from 'zod'
import { Button } from '@components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@components/ui/form'
import { Input } from '@components/ui/input'

const FormSchema = z.object({
  email: z.string().min(2, {
    message: 'You forgot to enter your email :)',
  }),
})

const SignupForm = () => {
  const { executeRecaptcha } = useReCaptcha()
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
    },
  })

  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState()

  const onSubmit = useCallback(
    async (data) => {
      const recaptchaToken = await executeRecaptcha('form_submit')

      const response = await fetch('/api/newsletter-subscribe', {
        method: 'POST',
        body: JSON.stringify({ email: data.email, recaptchaToken }),
        headers: { 'Content-Type': 'application/json' },
      })
      if (response.status === 201) {
        setIsSuccess(true)
      } else {
        setIsSuccess(false)

        const responseJson = await response.json()
        if (response.status === 400 || response.status === 403) {
          setErrorMessage(responseJson.error)
        }
      }
    },
    [executeRecaptcha],
  )

  return (
    <Form {...form}>
      <form
        className="flex w-full items-start md:w-[450px]"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="w-full md:w-[250px]">
              <FormControl>
                <Input
                  {...field}
                  className="h-10 w-full rounded-r-none"
                  type="email"
                  id="email"
                  placeholder="Your email address"
                  autoCapitalize="off"
                  autoCorrect="off"
                />
              </FormControl>
              <FormMessage />
              {isSuccess && (
                <p className="font-semibold text-green-700">
                  Thanks! You're now on our mailing list 🙌
                </p>
              )}
              {errorMessage && <p className="text-red-700">{errorMessage}</p>}
            </FormItem>
          )}
        ></FormField>
        <Button
          type="submit"
          className="h-10 cursor-pointer rounded-l-none rounded-r-md border-none text-white"
        >
          Submit
        </Button>
      </form>
      <p className="google-recaptcha-text mt-1 text-[10px]! max-w-[350px]">
        This site is protected by reCAPTCHA and the Google{' '}
        <a href="https://policies.google.com/privacy">Privacy Policy</a> and{' '}
        <a href="https://policies.google.com/terms">Terms of Service</a> apply.
      </p>
    </Form>
  )
}

export default SignupForm
