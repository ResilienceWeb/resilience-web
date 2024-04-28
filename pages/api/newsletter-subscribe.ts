import client from '@sendgrid/client'

client.setApiKey(process.env.SENDGRID_API_KEY)
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY

export default async (req, res) => {
  const { email, recaptchaToken } = req.body

  if (!email || !email.length) {
    return res.status(400).json({
      error: 'Forgot to add your email',
    })
  }

  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`
  const recaptchaRes = await fetch(verifyUrl, { method: 'POST' })
  const recaptchaInfo = await recaptchaRes.json()

  if (recaptchaInfo.score < 0.5) {
    return res.status(403).json({
      error:
        "Our automated checks think you're a bot 😬. If that's not right, please get in touch via the Get in Touch button at the top of the website and we can add you to the mailing list manually. Sorry!",
    })
  }

  const request = {
    url: `/v3/marketing/contacts`,
    method: 'PUT',
    body: {
      contacts: [
        {
          email,
        },
      ],
    },
  }

  try {
    // @ts-ignore
    await client.request(request)

    return res.status(201).json({ error: null })
  } catch (error) {
    console.error(`[RW] Failed to sign up user to newsletter - ${error}`)
    return res.status(400).json({
      error:
        'Oops, something went wrong. Please send an email to info@resilienceweb.org.uk and we can add you to the list.',
    })
  }
}
