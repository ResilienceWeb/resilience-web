'use client'

import type { Ref } from 'react'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'

type Props = {
  formRef?: Ref<HTMLFormElement>
  value: string
  onValueChange: (value: string) => void
  /** Called on focus, so the real form starts loading immediately. */
  onFocus: () => void
  onBlur: () => void
  onSubmit: () => void
}

/**
 * Stands in for the signup form until it loads, mirroring its markup so nothing
 * shifts when they swap. It is a working input rather than a skeleton: someone
 * who tabs into the footer before it scrolls into view can start typing, and
 * what they typed is handed to the real form.
 */
const SignupFormPlaceholder = ({
  formRef,
  value,
  onValueChange,
  onFocus,
  onBlur,
  onSubmit,
}: Props) => (
  <form
    ref={formRef}
    className="flex w-full items-start md:w-[450px]"
    onSubmit={(event) => {
      event.preventDefault()
      onSubmit()
    }}
  >
    <div className="flex w-full flex-col gap-2 md:w-[250px]">
      <Input
        className="h-10 w-full rounded-r-none"
        type="email"
        id="email"
        placeholder="Your email address"
        autoCapitalize="off"
        autoCorrect="off"
        value={value}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={(event) => onValueChange(event.target.value)}
      />
    </div>
    <Button
      type="submit"
      className="h-10 cursor-pointer rounded-l-none rounded-r-md border-none text-white"
    >
      Submit
    </Button>
  </form>
)

export default SignupFormPlaceholder
