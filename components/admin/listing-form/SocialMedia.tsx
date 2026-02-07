'use client'

import { useFormContext, useFieldArray } from 'react-hook-form'
import { AiOutlinePlus } from 'react-icons/ai'
import { FaShareAlt, FaTrash } from 'react-icons/fa'
import { socialMediaPlatforms } from '@helpers/socials'
import { Button } from '@components/ui/button'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@components/ui/form'
import { Input } from '@components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'

const SocialMedia = () => {
  const methods = useFormContext()
  const { fields, append } = useFieldArray({
    control: methods.control,
    name: 'socials',
  })

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between pb-2">
        <FormLabel className="font-semibold">Social Media</FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => {
            const currentSocials = methods.getValues('socials') || []
            const unusedPlatforms = socialMediaPlatforms.filter(
              (platform) =>
                !currentSocials.some((item) => item.platform === platform.id),
            )

            if (unusedPlatforms.length > 0) {
              append({ platform: unusedPlatforms[0].id, url: '' })
            }
          }}
          disabled={
            methods.getValues('socials')?.length >= socialMediaPlatforms.length
          }
        >
          <AiOutlinePlus className="mr-1" />
          Add Social Media link
        </Button>
      </div>

      <div className="flex flex-col gap-1">
        {fields.map((field, index) => {
          const currentValue = methods.getValues(`socials.${index}`)
          const platform = socialMediaPlatforms.find(
            (p) => p.id === currentValue?.platform,
          )
          return (
            <div
              key={field.id}
              className="group relative rounded-md border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="w-1/3">
                  <FormField
                    control={methods.control}
                    name={`socials.${index}.platform`}
                    render={({ field }) => (
                      <FormItem>
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
                                    const platform = socialMediaPlatforms.find(
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
                                const currentPlatforms = methods
                                  .getValues('socials')
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
                    name={`socials.${index}.url`}
                    render={({ field }) => (
                      <FormItem>
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

                <div className="ml-2 flex-shrink-0 self-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full opacity-70 hover:bg-red-50 hover:text-red-600 hover:opacity-100"
                    onClick={() => {
                      const currentSocials = [...methods.getValues('socials')]
                      currentSocials.splice(index, 1)
                      methods.setValue('socials', currentSocials)
                    }}
                  >
                    <FaTrash />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}

        {(!methods.watch('socials') ||
          methods.watch('socials').length === 0) && (
          <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 p-4 text-center">
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
                append({ platform: socialMediaPlatforms[0].id, url: '' })
              }}
            >
              <AiOutlinePlus className="mr-1" />
              Add Social Media link
            </Button>
          </div>
        )}

        {methods.watch('socials').length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2 w-fit"
            onClick={() => {
              const currentSocials = methods.getValues('socials') || []
              const unusedPlatforms = socialMediaPlatforms.filter(
                (platform) =>
                  !currentSocials.some((item) => item.platform === platform.id),
              )

              if (unusedPlatforms.length > 0) {
                append({ platform: unusedPlatforms[0].id, url: '' })
              }
            }}
            disabled={
              methods.getValues('socials')?.length >=
              socialMediaPlatforms.length
            }
          >
            <AiOutlinePlus className="mr-1" />
            Add Social Media link
          </Button>
        )}
      </div>
    </div>
  )
}

export default SocialMedia
