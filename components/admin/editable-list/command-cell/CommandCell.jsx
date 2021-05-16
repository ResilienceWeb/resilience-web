/* eslint-disable react/display-name */
import { Button, Stack } from '@chakra-ui/react';

function CommandCell({ cancel, enterEdit, save, editField, remove }) {
	return (props) => {
		if (!props.dataItem) return null;

		return props.dataItem[editField] ? (
			<td>
				<Stack direction="column" spacing={2}>
					<Button
						colorScheme="blue"
						className="k-button"
						onClick={() => save(props.dataItem)}
						size="sm"
					>
						Update
					</Button>
					<Button
						className="k-button"
						onClick={() => cancel(props.dataItem)}
						size="sm"
					>
						Cancel
					</Button>
				</Stack>
			</td>
		) : (
			<td>
				<Stack direction="column" spacing={2}>
					<Button
						colorScheme="blue"
						className="k-button"
						onClick={() => enterEdit(props.dataItem)}
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
		);
	};
}

export default CommandCell;
