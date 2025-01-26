'use client'
import { useEffect, useMemo } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { AiOutlineLoading } from 'react-icons/ai'
import ReactSelect from 'react-select'
import type { Options } from 'react-select'
import type { Category } from '@prisma/client'
import NextLink from 'next/link'
import dynamic from 'next/dynamic'
import { fieldRequiredValidator, urlValidator } from '@helpers/formValidation'
import ImageUpload from './ImageUpload'
import useTags from '@hooks/tags/useTags'
import useListings from '@hooks/listings/useListings'
import { useAppContext } from '@store/hooks'
import { generateSlug } from '@helpers/utils'
import EditorField from './RichTextEditor'
import { Button } from '@components/ui/button'

const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => <div className="pt-5 text-center">Loading…</div>,
})

interface FormValues {
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
  featured: boolean
  image: File | string | null
  slug: string
  tags: TagOption[]
  relations: TagOption[]
  noPhysicalLocation: boolean
  location?: {
    latitude: number
    longitude: number
    description: string
  }
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
  categories: Category[]
  listing?: Listing
  handleSubmit: (data: any) => void
  isSubmitting?: boolean
}

type TagOption = {
  value: number
  label: string
}

const SlugField = ({ isEditMode, register, watch, setValue, errors }) => {
  const { selectedWebSlug } = useAppContext()
  const title = watch('title')

  useEffect(() => {
    if (isEditMode) return

    const generatedSlug = generateSlug(title)
    if (title.trim() !== '') {
      setValue('slug', generatedSlug, { shouldValidate: true })
    }
  }, [setValue, title, isEditMode])

  return (
    <div>
      <label htmlFor="slug" className="mb-1 block text-sm font-semibold">
        Link to listing page
      </label>
      <div className="flex">
        <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
          {`${selectedWebSlug}.resilienceweb.org.uk/`}
        </span>
        <input
          {...register('slug', { validate: urlValidator })}
          id="slug"
          className="w-full rounded-r-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      {errors.slug && (
        <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
      )}
    </div>
  )
}

const ListingForm = ({
  categories,
  listing,
  handleSubmit: onSubmit,
  isSubmitting = false,
}: Props) => {
  const { tags } = useTags()
  const { listings } = useListings()

  const tagOptions: Options<TagOption> = useMemo(() => {
    if (!tags) return []
    return tags.map((t) => ({
      value: t.id,
      label: t.label,
    }))
  }, [tags])

  const relationOptions: Options<TagOption> = useMemo(() => {
    if (!listings) return []
    return listings
      .filter((l) => l.title !== listing?.title)
      .map((l) => ({
        value: l.id,
        label: l.title,
      }))
  }, [listing?.title, listings])

  const initialTagsValues = useMemo(() => {
    return listing?.tags?.map((t) => ({
      value: t.id,
      label: t.label,
    }))
  }, [listing?.tags])

  const initialRelationsValues = useMemo(() => {
    return listing?.relations?.map((l) => ({
      value: l.id,
      label: l.title,
    }))
  }, [listing?.relations])

  const methods = useForm<FormValues>({
    defaultValues: {
      id: listing?.id || null,
      title: listing?.title || '',
      description: listing?.description || '',
      category: listing?.categoryId || undefined,
      email: listing?.email || '',
      website: listing?.website || '',
      facebook: listing?.facebook || '',
      twitter: listing?.twitter || '',
      instagram: listing?.instagram || '',
      seekingVolunteers: listing?.seekingVolunteers || false,
      featured: listing?.featured || false,
      image: listing?.image,
      slug: listing?.slug || '',
      tags: initialTagsValues || [],
      relations: initialRelationsValues || [],
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
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = methods

  const handleSubmitForm = (data: any) => {
    const isNewImage = data.image instanceof File
    if (!isNewImage && data.image) {
      delete data.image
    }
    if (!data.noPhysicalLocation && data.location) {
      data.latitude = data.location.latitude
      data.longitude = data.location.longitude
      data.locationDescription = data.location.description
      delete data.location
    }
    data.tags = data.tags?.map((t) => t.value)
    data.relations = data.relations?.map((l) => l.value)
    if (listing) {
      const currentListingTagIds = listing?.tags?.map((t) => t.id)
      const removedTags = currentListingTagIds?.filter(
        (t) => !data.tags.includes(t),
      )
      data.removedTags = removedTags

      const currentListingRelationIds = listing?.relations?.map((r) => r.id)
      const removedRelations = currentListingRelationIds?.filter(
        (l) => !data.relations.includes(l),
      )
      data.removedRelations = removedRelations
    }
    onSubmit(data)
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(handleSubmitForm)}
        encType="multipart/form-data"
        className="px-4 py-4 sm:p-6"
      >
        <div className="mb-2">
          <label htmlFor="title" className="mb-1 block text-sm font-semibold">
            Title*
          </label>
          <input
            {...register('title', { validate: fieldRequiredValidator })}
            id="title"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div className="mb-2">
          <label
            htmlFor="category"
            className="mb-1 block text-sm font-semibold"
          >
            Category*
          </label>
          <select
            {...register('category', { validate: fieldRequiredValidator })}
            id="category"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-600">
            {categories.length === 0 ? (
              <span>
                Looks like you haven't created categories yet. You can add some{' '}
                <NextLink
                  href="/admin/categories"
                  className="text-blue-600 hover:text-blue-700"
                >
                  on this page
                </NextLink>
                .
              </span>
            ) : (
              'Categories can be easily changed later'
            )}
          </p>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">
              Please select a category
            </p>
          )}
        </div>

        <div className="mb-2">
          <label htmlFor="description" className="mb-1 text-sm font-semibold">
            Description*
          </label>
          <EditorField name="description" />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">
              Please add a description
            </p>
          )}
        </div>

        <ImageUpload name="image" />

        <div className="mb-2">
          <label htmlFor="email" className="mb-1 block text-sm font-semibold">
            Contact email for organisation
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="website"
              className="mb-1 block text-sm font-semibold"
            >
              Website
            </label>
            <input
              {...register('website')}
              id="website"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.website && (
              <p className="mt-1 text-sm text-red-600">
                {errors.website.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="facebook"
              className="mb-1 block text-sm font-semibold"
            >
              Facebook
            </label>
            <input
              {...register('facebook')}
              id="facebook"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.facebook && (
              <p className="mt-1 text-sm text-red-600">
                {errors.facebook.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="twitter"
              className="mb-1 block text-sm font-semibold"
            >
              Twitter
            </label>
            <input
              {...register('twitter')}
              id="twitter"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.twitter && (
              <p className="mt-1 text-sm text-red-600">
                {errors.twitter.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="instagram"
              className="mb-1 block text-sm font-semibold"
            >
              Instagram
            </label>
            <input
              {...register('instagram')}
              id="instagram"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.instagram && (
              <p className="mt-1 text-sm text-red-600">
                {errors.instagram.message}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <SlugField
            isEditMode={Boolean(listing)}
            register={register}
            watch={watch}
            setValue={setValue}
            errors={errors}
          />
        </div>

        <div className="mt-4">
          <label htmlFor="tags" className="mb-1 block text-sm font-semibold">
            Tags
          </label>
          <ReactSelect
            isMulti
            name="tags"
            options={tagOptions}
            styles={customMultiSelectStyles}
            value={watch('tags')}
            onChange={(newValue) => setValue('tags', [...newValue])}
          />
        </div>

        <div className="mt-4">
          <label
            htmlFor="relations"
            className="mb-1 block text-sm font-semibold"
          >
            Related listings
          </label>
          <ReactSelect
            isMulti
            name="relations"
            options={relationOptions}
            styles={customMultiSelectStyles}
            value={watch('relations')}
            onChange={(newValue) => setValue('relations', [...newValue])}
          />
        </div>

        <div className="mt-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...register('seekingVolunteers')}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm">Currently seeking volunteers</span>
          </label>
        </div>

        <div className="mt-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...register('featured')}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm">Featured listing</span>
          </label>
        </div>

        <div className="mt-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...register('noPhysicalLocation')}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm">
              This listing has no physical location
            </span>
          </label>
        </div>

        {!watch('noPhysicalLocation') && (
          <div className="mt-4">
            <Map />
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button
            type="submit"
            variant={listing?.pending ? 'purple' : 'default'}
            disabled={isSubmitting}
          >
            {isSubmitting && <AiOutlineLoading className="animate-spin" />}{' '}
            {listing ? (listing.pending ? 'Approve' : 'Update') : 'Create'}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}

export default ListingForm
