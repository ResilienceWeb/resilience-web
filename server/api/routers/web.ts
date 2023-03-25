import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '@server/api/trpc'

export const webRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z
        .object({ withListings: z.boolean().optional().default(false) })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.location.findMany({
        include: input?.withListings
          ? {
              listings: {
                select: {
                  id: true,
                  locationId: true,
                },
              },
            }
          : null,
      })
    }),
})

