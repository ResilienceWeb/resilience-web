'use client'

import { memo, useEffect, useMemo } from 'react'
import { useForm, useFormContext } from 'react-hook-form'
import ReactSelect from 'react-select'
import type { Options } from 'react-select'
import type { Category } from '@prisma/client'
import { AiOutlineLoading } from 'react-icons/ai'
import { urlValidator } from '@helpers/formValidation'
import ImageUpload from './ImageUpload'
import useTags from '@hooks/tags/useTags'
import useSelectedWebSlug from '@hooks/application/useSelectedWebSlug'
import { generateSlug } from '@helpers/utils'
import EditorField from './RichTextEditor'
import { Input } from '@components/ui/input'
import { Checkbox } from '@components/ui/checkbox'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@components/ui/form'
import { Button } from '@components/ui/button'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'

const SlugField = () => {
  const selectedWebSlug = useSelectedWebSlug()
  const { control, watch, setValue } = useFormContext()

  const title = watch('title')

  useEffect(() => {
    if (!title) {
      return
    }
    const generatedSlug = generateSlug(title)

    if (title?.trim() !== '') {
      setValue('slug', generatedSlug)
    }
  }, [setValue, title])

  return (
    <FormField
      control={control}
      name="slug"
      rules={{ validate: urlValidator }}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="font-semibold">Url</FormLabel>
          <div className="flex">
            <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
              {`${selectedWebSlug}.resilienceweb.org.uk/`}
            </span>
            <Input
              {...field}
              className="flex-1 rounded-r-md border-gray-300 text-sm shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

const customMultiSelectStyles = {
  container: (baseStyles) => ({
    ...baseStyles,
    width: '100%',
  }),
  menuPortal: (baseStyles) => ({
    ...baseStyles,
    zIndex: 10,
  }),
}

interface Props {
  listing?: Listing
  categories: Category[]
  handleSubmit: (data: any) => void
  isEditMode: boolean
}

type TagOption = {
  value: number
  label: string
}

const listingFormSchema = z.object({
  id: z.number().nullable(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z
    .number()
    .or(z.string())
    .transform((val) => Number(val)),
  email: z.string().email('Please enter a valid email').or(z.literal('')),
  website: z
    .string()
    .url('Please enter a valid URL (https://...)')
    .or(z.literal('')),
  facebook: z
    .string()
    .url('Please enter a valid URL (https://...)')
    .or(z.literal('')),
  twitter: z
    .string()
    .url('Please enter a valid URL (https://...)')
    .or(z.literal('')),
  instagram: z
    .string()
    .url('Please enter a valid URL (https://...)')
    .or(z.literal('')),
  seekingVolunteers: z.boolean(),
  image: z.any(),
  slug: z.string(),
  tags: z.array(z.object({ value: z.number(), label: z.string() })),
})

type FormValues = z.infer<typeof listingFormSchema>

const ListingFormSimplified = ({
  listing,
  categories,
  handleSubmit: onSubmit,
  isEditMode = false,
}: Props) => {
  const { tags } = useTags()
  const form = useForm<FormValues>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      id: listing?.id || null,
      title: listing?.title ?? '',
      description: listing?.description || '',
      category: listing?.categoryId || undefined,
      email: listing?.email || '',
      website: listing?.website || '',
      facebook: listing?.facebook || '',
      twitter: listing?.twitter || '',
      instagram: listing?.instagram || '',
      seekingVolunteers: listing?.seekingVolunteers || false,
      image: listing?.image,
      slug: listing?.slug || '',
      tags: [],
    },
  })

  const {
    formState: { isDirty, isSubmitting },
  } = form

  const tagOptions: Options<TagOption> = useMemo(() => {
    if (!tags) return []

    return tags.map((t) => ({
      value: t.id,
      label: t.label,
    }))
  }, [tags])

  const handleSubmitForm = (data: any) => {
    const formData = {
      ...data,
      tags: data.tags?.map((t) => t.value),
      relations: data.relations?.map((l) => l.value),
    }
    onSubmit(formData)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmitForm)} className="bg-white">
        <div className="space-y-3 p-4 sm:p-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">Title*</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">Category*</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={() => (
              <FormItem>
                <FormLabel className="font-semibold">Description*</FormLabel>
                <FormControl>
                  <EditorField name="description" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {!isEditMode && <ImageUpload name="image" isRequired={false} />}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">
                  Contact email for organisation
                </FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Website</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="facebook"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Facebook</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="twitter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Twitter</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instagram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Instagram</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {!isEditMode && <SlugField />}

          {tagOptions.length > 0 && (
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Tags</FormLabel>
                  <FormControl>
                    <ReactSelect
                      isMulti
                      name="tags"
                      options={tagOptions}
                      styles={customMultiSelectStyles}
                      value={field.value}
                      onChange={(newValue) => field.onChange([...newValue])}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="seekingVolunteers"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="font-semibold">
                    Seeking volunteers
                  </FormLabel>
                  <p className="text-sm text-gray-500">
                    Would this group benefit from having additional volunteers?
                  </p>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="bg-gray-50 p-3 text-right">
          <Button type="submit" disabled={!isDirty || isSubmitting}>
            {isSubmitting && <AiOutlineLoading className="animate-spin" />}{' '}
            Submit
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default memo(ListingFormSimplified)
