import { memo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { HexColorPicker } from 'react-colorful'
import { DialogFooter } from '@components/ui/dialog'
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@components/ui/tooltip'
import IconSelector from './IconSelector'

const randomHexColorCode = () => {
  const n = (Math.random() * 0xfffff * 1000000).toString(16)
  return n.slice(0, 6)
}

interface FormValues {
  label: string
  color: string
  icon: string
}

const CategoryForm = ({
  category,
  onDelete,
  onSubmit,
}: {
  category?: CategoryWithListings
  onDelete?: (data: any) => void
  onSubmit: (data: any) => void
}) => {
  const [color, setColor] = useState(category?.color)

  const form = useForm<FormValues>({
    defaultValues: {
      label: category?.label ?? '',
      color: category?.color ?? randomHexColorCode(),
      icon: category?.icon,
    },
  })

  const onSubmitForm = (values: FormValues) => {
    onSubmit(values)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmitForm)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="label"
          rules={{ required: 'Category label is required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category label</FormLabel>
              <FormControl>
                <Input {...field} className="bg-white" />
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
              <FormLabel>Category icon</FormLabel>
              <FormControl>
                <IconSelector
                  value={field.value}
                  onChange={(icon) => field.onChange(icon)}
                  color={color}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category color</FormLabel>
              <FormControl>
                <HexColorPicker
                  color={field.value}
                  onChange={(value) => {
                    setColor(value.substring(1))
                    field.onChange(value.substring(1))
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter className="flex flex-col gap-2">
          {category && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="destructive"
                    className="opacity-85"
                    onClick={onDelete}
                    disabled={category?.listings?.length > 0}
                    type="button"
                  >
                    Remove
                  </Button>
                </TooltipTrigger>
                {category?.listings?.length > 0 && (
                  <TooltipContent className="z-200">
                    To delete this category, first ensure there are no listings
                    associated with it
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )}

          <Button
            type="submit"
            disabled={!form.formState.isValid || form.formState.isSubmitting}
          >
            {category ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

export default memo(CategoryForm)
