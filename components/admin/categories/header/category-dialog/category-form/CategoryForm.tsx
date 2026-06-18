import { memo, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { useForm } from 'react-hook-form'
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
          rules={{
            required: 'Category color is required',
            pattern: {
              value: /^[0-9a-fA-F]{6}$/,
              message: 'Enter a valid 6-digit hex color code',
            },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category color</FormLabel>
              <FormControl>
                <div className="flex flex-col gap-3">
                  <HexColorPicker
                    color={`#${field.value}`}
                    onChange={(value) => {
                      const hex = value.replace('#', '')
                      setColor(hex)
                      field.onChange(hex)
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <div
                      className="size-9 shrink-0 rounded-md border"
                      style={{ backgroundColor: `#${field.value}` }}
                    />
                    <div className="relative w-32">
                      <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 select-none">
                        #
                      </span>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const hex = e.target.value
                            .replace(/[^0-9a-fA-F]/g, '')
                            .slice(0, 6)
                          setColor(hex)
                          field.onChange(hex)
                        }}
                        maxLength={6}
                        placeholder="000000"
                        className="bg-white pl-7 font-mono uppercase"
                      />
                    </div>
                  </div>
                </div>
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
                    disabled={category?._count?.listings > 0}
                    type="button"
                  >
                    Remove
                  </Button>
                </TooltipTrigger>
                {category?._count?.listings > 0 && (
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
