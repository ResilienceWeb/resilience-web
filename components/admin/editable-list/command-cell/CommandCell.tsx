/* eslint-disable react/display-name */
import { Button, Stack } from '@chakra-ui/react'

function CommandCell({ goToEdit, remove }) {
    return (props) => {
        if (!props.dataItem) return null

        return (
            <td>
                <Stack direction="column" spacing={2}>
                    <Button
                        colorScheme="blue"
                        className="k-button"
                        onClick={() => goToEdit(props.dataItem)}
                        size="sm"
                    >
                        Edit
                    </Button>
                    <Button
                        colorScheme="red"
                        onClick={() => remove(props.dataItem)}
                        size="sm"
                    >
                        Remove
                    </Button>
                </Stack>
            </td>
        )
    }
}

export default CommandCell
