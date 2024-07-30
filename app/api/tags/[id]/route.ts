import prisma from '../../../../prisma/client'

export async function DELETE(_request: Request, { params }) {
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
    return new Response(`Unable to delete tag - ${e}`, {
      status: 500,
    })
  }
}
