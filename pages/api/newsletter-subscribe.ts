import client from '@sendgrid/client'

client.setApiKey(process.env.SENDGRID_API_KEY)

export default async (req, res) => {
  const { email } = req.body

  if (!email || !email.length) {
    return res.status(400).json({
      error: 'Forgot to add your email',
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
