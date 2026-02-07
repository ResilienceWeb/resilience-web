'use client'

import { memo, useEffect, useMemo } from 'react'
import { useForm, useFormContext, useWatch } from 'react-hook-form'
import { AiOutlineLoading } from 'react-icons/ai'
import ReactSelect from 'react-select'
import type { Options } from 'react-select'
import dynamic from 'next/dynamic'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Category } from '@prisma-client'
import { z } from 'zod'
import { generateSlug } from '@helpers/utils'
import RichTextEditor from '@components/rich-text-editor'
import { Button } from '@components/ui/button'
import { Checkbox } from '@components/ui/checkbox'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@components/ui/form'
import { Input } from '@components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'
import { Separator } from '@components/ui/separator'
import useTags from '@hooks/tags/useTags'
import Actions from './Actions'
import ImageUpload from './ImageUpload'
import SocialMedia from './SocialMedia'

const SetLocationMap = dynamic(
  () => import('@components/admin/set-location-map'),
  {
    ssr: false,
    loading: () => <div className="pt-5 text-center">Loading…</div>,
  },
)

const SlugField = ({ webSlug }) => {
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
      render={({ field }) => (
        <FormItem>
          <FormLabel className="font-semibold">Link to listing page</FormLabel>
          <div className="flex">
            <span className="inline-flex shrink-0 items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
              {`${webSlug}.resilienceweb.org.uk/`}
            </span>
            <Input {...field} className="rounded-l-none" />
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
  webSlug: string
}

type TagOption = {
  value: number
  label: string
}

const socialItemSchema = z.object({
  platform: z.string(),
  url: z.url({ error: 'Please enter a valid URL (https://...)' }),
})

const actionItemSchema = z.object({
  type: z.string(),
  url: z.url({ error: 'Please enter a valid URL (https://...)' }),
})

const listingFormSchema = z.object({
  id: z.number().nullable(),
  title: z.string().min(1, { error: 'Title is required' }),
  description: z.string().min(1, { error: 'Description is required' }),
  category: z.coerce.number().nullable(),
  email: z.email({ error: 'Please enter a valid email' }).or(z.literal('')),
  website: z
    .url({ error: 'Please enter a valid URL (https://...)' })
    .or(z.literal('')),
  socials: z.array(socialItemSchema),
  actions: z.array(actionItemSchema),
  seekingVolunteers: z.boolean(),
  image: z.any(),
  slug: z
    .string()
    .min(1, { error: 'Slug is required' })
    .regex(/^[a-z0-9-]+$/, {
      error: 'Only lowercase letters, numbers, and hyphens are allowed',
    }),
  tags: z.array(z.object({ value: z.number(), label: z.string() })),
  noPhysicalLocation: z.boolean(),
  location: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
      description: z.string(),
    })
    .optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  locationDescription: z.string().optional(),
})

const ListingFormSimplified = ({
  listing,
  categories,
  handleSubmit: onSubmit,
  isEditMode = false,
  webSlug,
}: Props) => {
  const { tags } = useTags()
  const form = useForm({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      id: listing?.id || null,
      title: listing?.title ?? '',
      description: listing?.description || '',
      category: listing?.categoryId || undefined,
      email: listing?.email || '',
      website: listing?.website || '',
      socials: listing?.socials || [],
      actions: listing?.actions || [],
      seekingVolunteers: listing?.seekingVolunteers || false,
      image: listing?.image,
      slug: listing?.slug || '',
      tags: [],
      noPhysicalLocation: listing?.location?.noPhysicalLocation || false,
      location:
        listing?.location?.latitude && listing?.location?.longitude
          ? {
              latitude: listing.location.latitude,
              longitude: listing.location.longitude,
              description: listing.location.description,
            }
          : undefined,
    },
  })

  const {
    formState: { isDirty, isSubmitting },
    control,
  } = form

  const noPhysicalLocation = useWatch({
    control,
    name: 'noPhysicalLocation',
  })

  const tagOptions: Options<TagOption> = useMemo(() => {
    if (!tags) return []

    return tags.map((t) => ({
      value: t.id,
      label: t.label,
    }))
  }, [tags])

  const handleSubmitForm = (data: any) => {
    if (!data.noPhysicalLocation && data.location) {
      data.latitude = data.location.latitude
      data.longitude = data.location.longitude
      data.locationDescription = data.location.description
      delete data.location
    }

    const formData = {
      ...data,
      tags: data.tags?.map((t) => t.value),
      relations: data.relations?.map((l) => l.value),
      image: data.image === null ? null : data.image,
    }
    onSubmit(formData)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmitForm)}>
        <div className="flex flex-col gap-4 p-4 sm:p-6">
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
                  <RichTextEditor name="description" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <ImageUpload
            name="image"
            isRequired={false}
            isEditMode={isEditMode}
          />

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

          <SocialMedia />

          <Actions />

          {!isEditMode && <SlugField webSlug={webSlug} />}

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

          {!isEditMode && (
            <FormField
              control={form.control}
              name="seekingVolunteers"
              render={({ field }) => (
                <FormItem className="mt-4 flex flex-row items-start gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Currently seeking volunteers</FormLabel>
                    <p className="text-sm text-gray-500">
                      Would this group benefit from having more volunteers?
                    </p>
                  </div>
                </FormItem>
              )}
            />
          )}

          <Separator className="my-2" />

          <FormField
            control={form.control}
            name="noPhysicalLocation"
            render={({ field }) => (
              <>
                <FormLabel className="font-semibold">Location</FormLabel>
                <FormItem className="flex flex-row items-start gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="flex flex-col gap-1">
                    <FormLabel>No physical location</FormLabel>
                    <FormDescription>
                      If this listing does not have a physical location, please
                      check this box
                    </FormDescription>
                  </div>
                </FormItem>
              </>
            )}
          />

          {!noPhysicalLocation && (
            <SetLocationMap
              latitude={listing?.location?.latitude}
              longitude={listing?.location?.longitude}
              locationDescription={listing?.location?.description}
            />
          )}
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
