import * as z from 'zod'

export const notificationSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(140),
    body: z.string().trim().min(1, 'Body is required').max(2000),
    url: z
      .string()
      .trim()
      .url('Must be a valid URL')
      .optional()
      .or(z.literal('')),
    urlLabel: z.string().trim().max(60).optional().or(z.literal('')),
    severity: z.enum(['info', 'warning', 'critical']).default('info'),
    // v1 only uses ALL; ADMINS / WEB are accepted for forward compatibility.
    audience: z.enum(['ALL', 'ADMINS', 'WEB']).default('ALL'),
    targetWebIds: z.array(z.number().int()).optional(),
    publishAt: z.coerce.date().nullable().optional(),
    expiresAt: z.coerce.date().nullable().optional(),
  })
  .refine(
    (data) =>
      !data.publishAt ||
      !data.expiresAt ||
      data.expiresAt.getTime() > data.publishAt.getTime(),
    { message: 'Expiry must be after the publish date', path: ['expiresAt'] },
  )
  .refine(
    (data) => data.audience !== 'WEB' || (data.targetWebIds?.length ?? 0) > 0,
    {
      message: 'Select at least one web to target',
      path: ['targetWebIds'],
    },
  )

export type NotificationFormValues = z.infer<typeof notificationSchema>

// Normalises the validated payload into the shape the repository expects.
export function toRepositoryInput(data: NotificationFormValues) {
  return {
    title: data.title,
    body: data.body,
    url: data.url ? data.url : null,
    urlLabel: data.urlLabel ? data.urlLabel : null,
    severity: data.severity,
    audience: data.audience,
    targetWebIds: data.targetWebIds ?? [],
    publishAt: data.publishAt ?? null,
    expiresAt: data.expiresAt ?? null,
  }
}
