import { chakra, FormLabel, Switch, Flex } from '@chakra-ui/react';

const ModeSwitch = ({ handleSwitchChange, checked }) => {
	return (
		<chakra.div ml={4}>
			<Flex direction="row" alignItems="center" width="350px">
				<FormLabel textAlign="center" fontSize="sm" mb={0}>
					List view
				</FormLabel>
				<Switch
					isChecked={Boolean(checked)}
					onChange={handleSwitchChange}
					colorScheme="teal"
					size="lg"
					value={checked}
					height="28px"
				/>
				<FormLabel fontSize="sm" ml={2} mb={0}>
					Visual web mode
				</FormLabel>
			</Flex>
		</chakra.div>
	);
};

export default ModeSwitch;
