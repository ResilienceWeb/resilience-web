import type { NextApiRequest, NextApiResponse } from 'next'

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const previousUrl = req.headers.referer
    console.log(previousUrl)

    res.status(200)
    res.json({
      previousUrl,
    })
  } catch (e) {
    res.status(500)
    res.json({
      error: `Unable to get previous url - ${e}`,
    })
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
}

export default handler

