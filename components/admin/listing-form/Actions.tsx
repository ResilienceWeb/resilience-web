'use client'

import { useFormContext, useFieldArray } from 'react-hook-form'
import { AiOutlinePlus } from 'react-icons/ai'
import { FaMousePointer, FaTrash } from 'react-icons/fa'
import { actionTypes } from '@helpers/actions'
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

const Actions = () => {
  const methods = useFormContext()
  const { fields, append } = useFieldArray({
    control: methods.control,
    name: 'actions',
  })

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between pb-2">
        <FormLabel className="font-semibold">Action Buttons</FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => {
            const currentActions = methods.getValues('actions') || []
            const unusedTypes = actionTypes.filter(
              (actionType) =>
                !currentActions.some((item) => item.type === actionType.id),
            )

            if (unusedTypes.length > 0) {
              append({ type: unusedTypes[0].id, url: '' })
            }
          }}
          disabled={methods.getValues('actions')?.length >= actionTypes.length}
        >
          <AiOutlinePlus className="mr-1" />
          Add Action Button
        </Button>
      </div>

      <div className="flex flex-col gap-1">
        {fields.map((field, index) => {
          return (
            <div
              key={field.id}
              className="group relative rounded-md border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="w-1/3">
                  <FormField
                    control={methods.control}
                    name={`actions.${index}.type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm text-gray-600">
                          Action Type
                        </FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value)
                          }}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select action type">
                              {field.value && (
                                <div className="flex items-center gap-2">
                                  {(() => {
                                    const actionType = actionTypes.find(
                                      (a) => a.id === field.value,
                                    )
                                    if (actionType) {
                                      const Icon = actionType.icon
                                      return (
                                        <Icon
                                          style={{
                                            color: actionType.color,
                                          }}
                                        />
                                      )
                                    }
                                    return null
                                  })()}
                                  {
                                    actionTypes.find(
                                      (a) => a.id === field.value,
                                    )?.label
                                  }
                                </div>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {actionTypes
                              .filter((actionType) => {
                                const currentTypes = methods
                                  .getValues('actions')
                                  .map((item) => item.type)
                                return (
                                  actionType.id === field.value ||
                                  !currentTypes.includes(actionType.id)
                                )
                              })
                              .map((actionType) => (
                                <SelectItem
                                  key={actionType.id}
                                  value={actionType.id}
                                >
                                  <div className="flex items-center gap-2">
                                    {(() => {
                                      const Icon = actionType.icon
                                      return (
                                        <Icon
                                          style={{
                                            color: actionType.color,
                                          }}
                                        />
                                      )
                                    })()}
                                    {actionType.label}
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
                    name={`actions.${index}.url`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm text-gray-600">
                          URL
                        </FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input {...field} placeholder="https://" />
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
                      const currentActions = [...methods.getValues('actions')]
                      currentActions.splice(index, 1)
                      methods.setValue('actions', currentActions)
                    }}
                  >
                    <FaTrash />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}

        {(!methods.watch('actions') ||
          methods.watch('actions').length === 0) && (
          <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 p-4 text-center">
            <div className="mb-2 rounded-full bg-gray-100 p-3">
              <FaMousePointer className="text-2xl text-gray-400" />
            </div>
            <p className="text-muted-foreground mb-2">
              No action buttons added
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => {
                append({ type: actionTypes[0].id, url: '' })
              }}
            >
              <AiOutlinePlus className="mr-1" />
              Add Action Button
            </Button>
          </div>
        )}

        {methods.watch('actions').length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2 w-fit"
            onClick={() => {
              const currentActions = methods.getValues('actions') || []
              const unusedTypes = actionTypes.filter(
                (actionType) =>
                  !currentActions.some((item) => item.type === actionType.id),
              )

              if (unusedTypes.length > 0) {
                append({ type: unusedTypes[0].id, url: '' })
              }
            }}
            disabled={
              methods.getValues('actions')?.length >= actionTypes.length
            }
          >
            <AiOutlinePlus className="mr-1" />
            Add Action Button
          </Button>
        )}
      </div>
    </div>
  )
}

export default Actions
