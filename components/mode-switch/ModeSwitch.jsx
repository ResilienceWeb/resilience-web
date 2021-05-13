import { chakra } from '@chakra-ui/react';
import { Switch } from '@progress/kendo-react-inputs';
import { Label } from '@progress/kendo-react-labels';

const ModeSwitch = ({ handleSwitchChange, checked }) => {
	return (
		<chakra.div
			position="absolute"
			right="0"
			padding="0.5rem"
			zIndex={6}
			mt="0.8125rem"
			mr="0.5rem"
		>
			<Label editorId="mode-switch">Filter by category&nbsp;</Label>
			<Switch
				checked={checked}
				editorId="mode-switch"
				onChange={handleSwitchChange}
				onLabel=""
				offLabel=""
			/>
			<Label editorId="mode-switch">&nbsp;Visual web mode</Label>
		</chakra.div>
	);
};

export default ModeSwitch;