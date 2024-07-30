import prisma from '../../../../prisma/client'

export async function DELETE(_request: Request, { params }) {
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
    return new Response(`Unable to delete category - ${e}`, {
      status: 500,
    })
  }
}
