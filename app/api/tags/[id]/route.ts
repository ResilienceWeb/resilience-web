import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'

export async function DELETE(_request: Request, props) {
  const params = await props.params
  const id = params.id

  try {
    const tag = await prisma.tag.delete({
      where: {
        id: Number(id),
      },
    })

    return Response.json({ data: tag })
  } catch (e) {
    console.error(`[RW] Unable to delete tag - ${e}`)
    Sentry.captureException(e)
    return new Response(`Unable to delete tag - ${e}`, {
      status: 500,
    })
  }
}
