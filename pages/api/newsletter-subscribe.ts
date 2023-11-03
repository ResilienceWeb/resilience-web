const getRequestParams = (email) => {
  const API_KEY = process.env.MAILCHIMP_API_KEY
  const LIST_ID = process.env.MAILCHIMP_LIST_ID
  const DATACENTER = process.env.MAILCHIMP_API_KEY.split('-')[1]

  const url = `https://${DATACENTER}.api.mailchimp.com/3.0/lists/${LIST_ID}/members`

  const data = {
    email_address: email,
    status: 'subscribed',
  }

  const base64ApiKey = Buffer.from(`anystring:${API_KEY}`).toString('base64')
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Basic ${base64ApiKey}`,
  }

  return {
    url,
    data,
    headers,
  }
}

export default async (req, res) => {
  const { email } = req.body

  if (!email || !email.length) {
    return res.status(400).json({
      error: 'Forgot to add your email',
    })
  }

  try {
    const { url, data, headers } = getRequestParams(email)

    await fetch(url, { method: 'POST', body: JSON.stringify(data), headers })

    return res.status(201).json({ error: null })
  } catch (error) {
    console.error(`[RW] Failed to sign up user to newsletter - ${error}`)
    return res.status(400).json({
      error:
        'Oops, something went wrong. Please send an email to cambridgeresilienceweb@gmail.com and we can add you to the list.',
    })
  }
}
