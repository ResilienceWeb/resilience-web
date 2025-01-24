'use client'

import { memo, useEffect, useMemo } from 'react'
import { useForm, useFormContext } from 'react-hook-form'
import ReactSelect from 'react-select'
import type { Options } from 'react-select'
import type { Category } from '@prisma/client'
import { fieldRequiredValidator, urlValidator } from '@helpers/formValidation'
import ImageUpload from './ImageUpload'
import useTags from '@hooks/tags/useTags'
import useSelectedWebSlug from '@hooks/application/useSelectedWebSlug'
import { generateSlug } from '@helpers/utils'
import EditorField from './RichTextEditor'
import { Input } from '@components/ui/input'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@components/ui/form'

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
          <FormLabel>Url</FormLabel>
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

type FormValues = {
  id: number | null
  title: string
  description: string
  category: number | undefined
  email: string
  website: string
  facebook: string
  twitter: string
  instagram: string
  seekingVolunteers: boolean
  image: File | string | null
  slug: string
  tags: TagOption[]
}

const ListingFormSimplified = ({
  listing,
  categories,
  handleSubmit: onSubmit,
  isEditMode = false,
}: Props) => {
  const { tags } = useTags()
  const form = useForm<FormValues>({
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
    formState: { isDirty, isValid, isSubmitting }
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
        <div className="p-4 sm:p-6">
          <FormField
            control={form.control}
            name="title"
            rules={{ validate: fieldRequiredValidator }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">Title*</FormLabel>
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
            rules={{ validate: fieldRequiredValidator }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">
                  Category*
                </FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-green-500 focus:ring-green-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            rules={{ validate: fieldRequiredValidator }}
            render={() => (
              <FormItem>
                <FormLabel>Description*</FormLabel>
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
                <FormLabel>Contact email for organisation</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
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
                  <FormLabel>Facebook</FormLabel>
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
                  <FormLabel>Twitter</FormLabel>
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
                  <FormLabel>Instagram</FormLabel>
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
                  <FormLabel>Tags</FormLabel>
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
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Seeking volunteers</FormLabel>
                  <p className="text-sm text-gray-500">
                    Would this group benefit from having additional volunteers?
                  </p>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="bg-gray-50 p-3 text-right">
          <button
            type="submit"
            disabled={!isValid || !isDirty || isSubmitting}
            className="inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            title={!isDirty ? "You haven't made any changes yet" : undefined}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </Form>
  )
}

export default memo(ListingFormSimplified)
