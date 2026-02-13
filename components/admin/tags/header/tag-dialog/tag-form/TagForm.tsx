import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@components/ui/tooltip'

const formSchema = z.object({
  label: z.string().min(1, 'Label is required'),
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
    },
  })

  function handleSubmit(data: FormValues) {
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

        <DialogFooter className="flex flex-col gap-2">
          {tag && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={tag?.listings?.length > 0}
                    className="opacity-85"
                    onClick={onDelete}
                  >
                    Remove
                  </Button>
                </TooltipTrigger>
                {tag?.listings?.length > 0 && (
                  <TooltipContent>
                    <p>
                      To delete this tag, first ensure there are no listings
                      associated with it
                    </p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
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
