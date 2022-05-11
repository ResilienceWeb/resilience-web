import { memo } from 'react'
import { chakra, FormLabel, Switch, Flex } from '@chakra-ui/react'

const VolunteerSwitch = ({ handleSwitchChange, checked }) => {
    return (
        <chakra.div ml={2} mr={2}>
            <Flex
                direction="row"
                alignItems="center"
                justifyContent="center"
                width="150px"
            >
                <FormLabel textAlign="center" fontSize="sm" mb={0}>
                    Seeking volunteers
                </FormLabel>
                <Switch
                    isChecked={Boolean(checked)}
                    onChange={handleSwitchChange}
                    colorScheme="teal"
                    size="lg"
                    value={checked}
                    height="28px"
                />
            </Flex>
        </chakra.div>
    )
}

export default memo(VolunteerSwitch)
