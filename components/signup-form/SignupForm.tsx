import { useState, type Ref } from 'react'
import { useForm } from 'react-hook-form'
import { useReCaptcha } from 'next-recaptcha-v3'
import { Button } from '@components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@components/ui/form'
import { Input } from '@components/ui/input'

type FormValues = {
  email: string
}

const EMAIL_RULES = {
  required: 'Please enter your email address.',
  minLength: { value: 2, message: 'Please enter your email address.' },
}

type Props = {
  /** Attached to the form element so its visibility can be observed for lazy reCAPTCHA loading. */
  formRef?: Ref<HTMLFormElement>
}

const SignupForm = ({ formRef }: Props) => {
  const { executeRecaptcha } = useReCaptcha()
  const form = useForm<FormValues>({
    defaultValues: {
      email: '',
    },
  })

  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState()

  const onSubmit = async (data) => {
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
  }

  return (
    <Form {...form}>
      <form
        ref={formRef}
        className="flex w-full items-start md:w-[450px]"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="email"
          rules={EMAIL_RULES}
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
