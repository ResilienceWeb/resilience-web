import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { isSharedTag, sameTagLabel } from '@helpers/tags'
import IconPicker from '@components/icon-picker'
import TagChip from '@components/tag-chip'
import { Button } from '@components/ui/button'
import { DialogFooter } from '@components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/ui/form'
import { Input } from '@components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@components/ui/tooltip'
import useSharedTags from '@hooks/tags/useSharedTags'
import useTags from '@hooks/tags/useTags'

const formSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  icon: z.string().nullable(),
})

type FormValues = z.infer<typeof formSchema>

const TagForm = ({
  onSubmit,
  onDelete,
  tag,
}: {
  onSubmit: (data: FormValues) => void
  onDelete?: (data: any) => void
  tag?: TagWithListings
}) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: tag?.label ?? '',
      icon: tag?.icon ?? null,
    },
  })
  const label = useWatch({ control: form.control, name: 'label' })
  const { tags } = useTags()
  const { sharedTags } = useSharedTags()
  const isUsed = (tag?._count?.listings ?? 0) > 0

  function handleSubmit(data: FormValues) {
    const sharedTag = [
      ...(tags?.filter(isSharedTag) ?? []),
      ...(sharedTags ?? []),
    ].find((t) => sameTagLabel(t.label, data.label))
    if (sharedTag) {
      form.setError('label', {
        message: `"${sharedTag.label}" is already a shared tag, which every web can use. Add it from the shared tags instead.`,
      })
      return
    }
    onSubmit(data)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tag label</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tag icon (optional)</FormLabel>
              <FormControl>
                <IconPicker
                  value={field.value}
                  onChange={field.onChange}
                  description="Select an icon to show on this tag"
                  allowNone
                  monochrome
                  renderPreview={(icon) => (
                    <TagChip
                      tag={{
                        label: label || 'Tag',
                        icon: icon.name,
                      }}
                    />
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter className="flex flex-col gap-2">
          {tag && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isUsed}
                  className="opacity-85"
                  onClick={onDelete}
                >
                  Remove tag
                </Button>
              </TooltipTrigger>
              {isUsed && (
                <TooltipContent>
                  <p>
                    To delete this tag, first ensure there are no listings
                    associated with it
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          )}
          <Button type="submit" disabled={!form.formState.isValid}>
            {tag ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

export default TagForm
