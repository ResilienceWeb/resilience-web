import { Button } from '@components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/ui/form'
import { Input } from '@components/ui/input'
import { DialogFooter } from '@components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@components/ui/tooltip'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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

        <DialogFooter>
          {tag && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={tag?.listings?.length > 0}
                      className="opacity-85"
                      onClick={onDelete}
                    >
                      Remove
                    </Button>
                  </div>
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
          <Button
            type="submit"
            disabled={!form.formState.isValid}
            className="ml-2"
          >
            {tag ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

export default TagForm
