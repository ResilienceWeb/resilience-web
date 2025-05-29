'use client'

import { useCallback, useEffect } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import Select from 'react-select'
import type { MultiValue, ActionMeta } from 'react-select'
import { useAppContext } from '@store/hooks'
import { toast } from 'sonner'
import ImageUpload from '@components/admin/listing-form/ImageUpload'
import { Button } from '@components/ui/button'
import { Checkbox } from '@components/ui/checkbox'
import {
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
  FormControl,
} from '@components/ui/form'
import { Input } from '@components/ui/input'
import { Spinner } from '@components/ui/spinner'
import { Textarea } from '@components/ui/textarea'
import usePermissions from '@hooks/permissions/usePermissions'
import useUpdateWeb from '@hooks/webs/useUpdateWeb'
import useWeb from '@hooks/webs/useWeb'
import useWebs from '@hooks/webs/useWebs'

interface WebSettingsForm {
  title: string
  published: boolean
  description: string
  image: File | string | null
}

type WebOption = {
  value: string
  label: string
}

function WebsSelect() {
  const { webs, isPending } = useWebs()

  const options: WebOption[] =
    webs?.map((web) => ({
      value: web.slug,
      label: web.title,
    })) || []

  const handleChange = (
    newValue: MultiValue<WebOption>,
    _actionMeta: ActionMeta<WebOption>,
  ) => {
    console.log('Selected:', newValue)
    // Here you would handle the selection, perhaps updating state or form values
  }

  if (isPending) return <Spinner />

  return (
    <Select<WebOption, true>
      isMulti
      name="relatedWebs"
      options={options}
      placeholder="Select related webs..."
      isSearchable
      onChange={handleChange}
    />
  )
}

export default function WebSettingsPage() {
  const { isPending: isPendingPermissions } = usePermissions()
  const { selectedWebSlug } = useAppContext()
  const { web: webData } = useWeb({ webSlug: selectedWebSlug })
  const { updateWeb, isPending, isSuccess } = useUpdateWeb()

  const methods = useForm<WebSettingsForm>({
    defaultValues: {
      title: '',
      published: false,
      description: '',
      image: null,
    },
  })

  const {
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    reset,
    setValue,
  } = methods

  useEffect(() => {
    if (webData) {
      reset({
        title: webData.title || '',
        published: Boolean(webData.published),
        description: webData.description || '',
        image: webData.image || null,
      })
    }
  }, [webData, reset])

  useEffect(() => {
    if (isSuccess) {
      toast.success('Web updated successfully')
    }
  }, [isSuccess])

  const onSubmit = useCallback(
    (data: WebSettingsForm) => {
      const dataToSubmit: any = {
        title: data.title,
        description: data.description,
        published: data.published,
        slug: webData?.slug,
      }

      if (typeof data.image !== 'string') {
        dataToSubmit.image = data.image
      }
      updateWeb(dataToSubmit)
    },
    [updateWeb, webData?.slug],
  )

  if (isPendingPermissions) {
    return <Spinner />
  }

  const isPublished = watch('published')

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Web settings</h1>
        <p className="text-gray-600">
          This page is only accessible to web owners.
        </p>
        <div className="my-4 rounded-md bg-white p-4 shadow-md">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-6">
                <FormField
                  control={methods.control}
                  name="published"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled
                        />
                      </FormControl>
                      <FormLabel className="text-sm leading-none font-medium">
                        Published
                      </FormLabel>
                    </FormItem>
                  )}
                />
                {errors.published && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.published.message}
                  </p>
                )}
                {!isPublished && (
                  <p className="mt-2 text-sm text-gray-600">
                    We don't allow self-publishing webs yet. When your web is
                    ready to share with the world, please get in touch at{' '}
                    <a
                      href="mailto:info@resilienceweb.org.uk"
                      className="font-semibold hover:text-gray-700"
                    >
                      info@resilienceweb.org.uk
                    </a>{' '}
                    and we'll review and publish it for you. Please make sure
                    your web has at least 10 listings with complete information
                    and images, and that your web has a cover image uploaded
                    below.
                  </p>
                )}
              </div>

              <div className="mb-6">
                <FormLabel className="font-semibold">Web Title</FormLabel>
                <FormDescription className="mb-2">
                  The title of your web (e.g. "York" or "Brighton & Hove")
                </FormDescription>
                <Input
                  name="title"
                  value={watch('title') || ''}
                  onChange={(e) =>
                    setValue('title', e.target.value, { shouldDirty: true })
                  }
                  placeholder="Enter web title"
                  className="max-w-md"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <FormField
                control={methods.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Description</FormLabel>
                    <FormDescription>
                      A brief description of your web and its purpose. If you
                      represent a local group, feel free to include information
                      about it.
                    </FormDescription>
                    <Textarea {...field} rows={3} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <ImageUpload
                name="image"
                helperText={`This should be a picture that best represents ${webData?.title}`}
              />

              <FormLabel className="font-semibold">
                Related/neighbouring webs
              </FormLabel>
              <FormDescription className="mb-2">
                You can link to other webs that are related to this one. These
                will appear on the Network view as clickable items.
              </FormDescription>

              <div className="mb-6 max-w-md">
                <WebsSelect />
              </div>

              <div className="mt-6 flex justify-end">
                <Button type="submit" disabled={!isDirty || isPending}>
                  {isPending ? 'Updating...' : 'Update'}
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  )
}
