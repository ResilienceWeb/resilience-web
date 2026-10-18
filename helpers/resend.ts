import { Resend } from 'resend'

let resend: Resend | undefined

export const getResend = () =>
  (resend ??= new Resend(process.env.RESEND_API_KEY))
