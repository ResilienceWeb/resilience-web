'use client'

import { memo } from 'react'
import { Checkbox } from '@components/ui/checkbox'

interface VolunteerSwitchProps {
  handleSwitchChange: (checked: boolean) => void
  checked: boolean
}

const VolunteerSwitch = ({
  handleSwitchChange,
  checked,
}: VolunteerSwitchProps) => {
  return (
    <div className="w-full px-2.5">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="volunteer"
          checked={Boolean(checked)}
          onCheckedChange={handleSwitchChange}
          className="text-primary"
        />
        <label
          htmlFor="volunteer"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Seeking volunteers
        </label>
      </div>
    </div>
  )
}

export default memo(VolunteerSwitch)
