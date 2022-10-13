import { memo } from 'react'
import { Box, Checkbox } from '@chakra-ui/react'

const VolunteerSwitch = ({ handleSwitchChange, checked }) => {
  return (
    <Box width="100%" px="10px">
      <Checkbox isChecked={Boolean(checked)} onChange={handleSwitchChange}>
        Seeking volunteers
      </Checkbox>
    </Box>
  )
}

export default memo(VolunteerSwitch)
