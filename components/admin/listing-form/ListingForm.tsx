'use client'
import { useEffect, useMemo } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { AiOutlineLoading, AiOutlinePlus } from 'react-icons/ai'
import ReactSelect from 'react-select'
import type { Options } from 'react-select'
import type { Category } from '@prisma/client'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import useTags from '@hooks/tags/useTags'
import useListings from '@hooks/listings/useListings'
import { useAppContext } from '@store/hooks'
import { generateSlug } from '@helpers/utils'
import EditorField from './RichTextEditor'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Checkbox } from '@components/ui/checkbox'
import { socialMediaPlatforms } from '@helpers/form'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@components/ui/form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import ImageUpload from './ImageUpload'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'
import { FaShareAlt, FaTrash } from 'react-icons/fa'

const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => <div className="pt-5 text-center">Loading…</div>,
})

const socialMediaItemSchema = z.object({
  platform: z.string(),
  url: z
    .string()
    .url('Please enter a valid URL (https://...)')
    .or(z.literal('')),
})

const listingFormSchema = z.object({
  id: z.number().or(z.null()),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  email: z.string().email('Please enter a valid email').or(z.literal('')),
  website: z
    .string()
    .url('Please enter a valid URL (https://...)')
    .or(z.literal('')),
  socialMedia: z.array(socialMediaItemSchema),
  seekingVolunteers: z.boolean(),
  featured: z.boolean(),
  image: z.any(),
  slug: z.string().min(1, 'Slug is required'),
  tags: z.array(z.object({ value: z.number(), label: z.string() })),
  relations: z.array(z.object({ value: z.number(), label: z.string() })),
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

type FormValues = z.infer<typeof listingFormSchema>

interface Props {
  categories: Category[]
  listing?: Listing
  handleSubmit: (data: any) => void
  isSubmitting?: boolean
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
          {...register('slug')}
          id="slug"
          className="w-full rounded-r-md border border-gray-300 px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
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
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      id: listing?.id || null,
      title: listing?.title || '',
      description: listing?.description || '',
      category: listing?.categoryId ? String(listing?.categoryId) : undefined,
      email: listing?.email || '',
      website: listing?.website || '',
      socialMedia: listing?.socialMedia || [
        // Convert existing social media links to the new format if they exist
        ...(listing?.facebook
          ? [{ platform: 'facebook', url: listing.facebook }]
          : []),
        ...(listing?.twitter
          ? [{ platform: 'twitter', url: listing.twitter }]
          : []),
        ...(listing?.instagram
          ? [{ platform: 'instagram', url: listing.instagram }]
          : []),
      ],
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

  const handleSubmitForm = (submittedData: any) => {
    const data = {
      ...submittedData,
      category: Number(submittedData.category),
    }

    // Extract individual social media fields from the socialMedia array
    if (data.socialMedia && Array.isArray(data.socialMedia)) {
      // Convert the socialMedia array to individual fields for backward compatibility
      data.socialMedia.forEach((item) => {
        if (item.platform && item.url) {
          data[item.platform] = item.url
        }
      })
    }

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
      <Form {...methods}>
        <form
          onSubmit={handleSubmit(handleSubmitForm)}
          encType="multipart/form-data"
          className="px-4 py-4 sm:p-6"
        >
          <FormField
            control={methods.control}
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
            control={methods.control}
            name="category"
            render={({ field }) => {
              return (
                <FormItem className="mt-4">
                  <FormLabel className="font-semibold">Category*</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={String(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <FormDescription>
                      {categories.length === 0 ? (
                        <span>
                          Looks like you haven't created categories yet. You can
                          add some{' '}
                          <Link
                            href="/admin/categories"
                            className="text-green-700 hover:text-green-800"
                          >
                            on this page
                          </Link>
                          .
                        </span>
                      ) : (
                        'Categories can be easily changed later'
                      )}
                    </FormDescription>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )
            }}
          />

          <FormField
            control={methods.control}
            name="description"
            render={() => (
              <FormItem className="mt-4">
                <FormLabel className="font-semibold">Description*</FormLabel>
                <FormControl>
                  <EditorField name="description" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="mt-4">
            <ImageUpload name="image" />
          </div>

          <FormField
            control={methods.control}
            name="email"
            render={({ field }) => (
              <FormItem className="mt-4">
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
            control={methods.control}
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

          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between pb-2">
              <FormLabel className="text-lg font-semibold">
                Social Media
              </FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => {
                  const currentSocialMedia =
                    methods.getValues('socialMedia') || []
                  // Find a platform that hasn't been used yet
                  const unusedPlatforms = socialMediaPlatforms.filter(
                    (platform) =>
                      !currentSocialMedia.some(
                        (item) => item.platform === platform.id,
                      ),
                  )

                  if (unusedPlatforms.length > 0) {
                    methods.setValue('socialMedia', [
                      ...currentSocialMedia,
                      { platform: unusedPlatforms[0].id, url: '' },
                    ])
                  }
                }}
                disabled={
                  methods.getValues('socialMedia')?.length >=
                  socialMediaPlatforms.length
                }
              >
                <AiOutlinePlus className="mr-1" />
                Add Social Media
              </Button>
            </div>

            <div className="flex flex-col gap-1">
              {methods.watch('socialMedia')?.map((item, index) => {
                const platform = socialMediaPlatforms.find(
                  (p) => p.id === item.platform,
                )
                return (
                  <div
                    key={index}
                    className="group relative rounded-md border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="flex items-end gap-4">
                      <div className="w-1/3">
                        <FormField
                          control={methods.control}
                          name={`socialMedia.${index}.platform`}
                          render={({ field }) => (
                            <FormItem className="space-y-1">
                              <FormLabel className="text-sm text-gray-600">
                                Platform
                              </FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={(value) => {
                                  field.onChange(value)
                                }}
                              >
                                <SelectTrigger className="bg-white">
                                  <SelectValue placeholder="Select platform">
                                    {field.value && (
                                      <div className="flex items-center gap-2">
                                        {(() => {
                                          const platform =
                                            socialMediaPlatforms.find(
                                              (p) => p.id === field.value,
                                            )
                                          if (platform) {
                                            const Icon = platform.icon
                                            return (
                                              <Icon
                                                style={{
                                                  color: platform.color,
                                                }}
                                              />
                                            )
                                          }
                                          return null
                                        })()}
                                        {
                                          socialMediaPlatforms.find(
                                            (p) => p.id === field.value,
                                          )?.label
                                        }
                                      </div>
                                    )}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  {socialMediaPlatforms
                                    .filter((platform) => {
                                      // Allow the current platform or platforms not already selected
                                      const currentPlatforms = methods
                                        .getValues('socialMedia')
                                        .map((item) => item.platform)
                                      return (
                                        platform.id === field.value ||
                                        !currentPlatforms.includes(platform.id)
                                      )
                                    })
                                    .map((platform) => (
                                      <SelectItem
                                        key={platform.id}
                                        value={platform.id}
                                      >
                                        <div className="flex items-center gap-2">
                                          {(() => {
                                            const Icon = platform.icon
                                            return (
                                              <Icon
                                                style={{
                                                  color: platform.color,
                                                }}
                                              />
                                            )
                                          })()}
                                          {platform.label}
                                        </div>
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex-1">
                        <FormField
                          control={methods.control}
                          name={`socialMedia.${index}.url`}
                          render={({ field }) => (
                            <FormItem className="space-y-1">
                              <FormLabel className="text-sm text-gray-600">
                                URL
                              </FormLabel>
                              <div className="relative">
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder={platform?.prefix || 'https://'}
                                  />
                                </FormControl>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="ml-2 flex-shrink-0 self-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-full opacity-70 hover:bg-red-50 hover:text-red-600 hover:opacity-100"
                          onClick={() => {
                            const currentSocialMedia = [
                              ...methods.getValues('socialMedia'),
                            ]
                            currentSocialMedia.splice(index, 1)
                            methods.setValue('socialMedia', currentSocialMedia)
                          }}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}

              {(!methods.watch('socialMedia') ||
                methods.watch('socialMedia').length === 0) && (
                <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                  <div className="mb-2 rounded-full bg-gray-100 p-3">
                    <FaShareAlt className="text-2xl text-gray-400" />
                  </div>
                  <p className="text-muted-foreground mb-2">
                    No social media links added
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      methods.setValue('socialMedia', [
                        { platform: socialMediaPlatforms[0].id, url: '' },
                      ])
                    }}
                  >
                    <AiOutlinePlus className="mr-1" />
                    Add Social Media
                  </Button>
                </div>
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
            <FormLabel className="font-semibold">Tags</FormLabel>
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
            <FormLabel className="font-semibold">Related listings</FormLabel>
            <ReactSelect
              isMulti
              name="relations"
              options={relationOptions}
              styles={customMultiSelectStyles}
              value={watch('relations')}
              onChange={(newValue) => setValue('relations', [...newValue])}
            />
          </div>

          <FormField
            control={methods.control}
            name="seekingVolunteers"
            render={({ field }) => (
              <FormItem className="mt-4 flex flex-row items-start gap-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="flex flex-col gap-1">
                  <FormLabel>Currently seeking volunteers</FormLabel>
                  <FormDescription>
                    Check this if your group would benefit from having
                    additional volunteers
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={methods.control}
            name="featured"
            render={({ field }) => (
              <FormItem className="mt-4 flex flex-row items-start gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="flex flex-col gap-1">
                  <FormLabel>Featured listing</FormLabel>
                  <FormDescription>
                    Featured listings appear at the top of search results
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={methods.control}
            name="noPhysicalLocation"
            render={({ field }) => (
              <FormItem className="mt-4 flex flex-row items-start gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="flex flex-col gap-1">
                  <FormLabel>This listing has no physical location</FormLabel>
                  <FormDescription>
                    If this listing does not have a physical location, please
                    check this box
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

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

          {/* <div className="mt-2 flex justify-end">
            <FormMessage className="text-sm">
              {!isValid &&
                isDirty &&
                'There are some errors, please scroll up and check them.'}
            </FormMessage>
          </div> */}
        </form>
      </Form>
    </FormProvider>
  )
}

export default ListingForm
