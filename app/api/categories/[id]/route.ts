import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'

export async function DELETE(_request: Request, props) {
  const params = await props.params
  const id = params.id

  try {
    const category = await prisma.category.delete({
      where: {
        id: Number(id),
      },
    })

    return Response.json({ data: category })
  } catch (e) {
    console.error(`[RW] Unable to delete category - ${e}`)
    Sentry.captureException(e)
    return new Response(`Unable to delete category - ${e}`, {
      status: 500,
    })
  }
}
