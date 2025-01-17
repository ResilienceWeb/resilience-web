'use client'

import { Switch } from '@components/ui/switch'
import { Label } from '@components/ui/label'

interface ModeSwitchProps {
  handleSwitchChange: (checked: boolean) => void
  checked: boolean
}

const ModeSwitch = ({ handleSwitchChange, checked }: ModeSwitchProps) => {
  return (
    <div className="mx-2">
      <div className="flex w-[200px] flex-row items-center justify-center">
        <Label className="mb-0 ml-0 mr-2 text-center text-sm">List view</Label>
        <Switch checked={checked} onCheckedChange={handleSwitchChange} />
        <Label className="mb-0 ml-2 mr-0 text-sm">Web view</Label>
      </div>
    </div>
  )
}

export default ModeSwitch
