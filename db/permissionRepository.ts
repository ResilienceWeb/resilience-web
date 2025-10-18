import prisma from '@prisma-rw'

export const removeUserPermission = async (
  userEmail: string,
  webId: number,
) => {
  await prisma.permission.update({
    where: {
      email: userEmail,
    },
    data: {
      webs: {
        disconnect: {
          id: webId,
        },
      },
    },
  })
}
