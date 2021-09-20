import { chakra, FormLabel, Switch, Flex } from '@chakra-ui/react';

const ModeSwitch = ({ handleSwitchChange, checked }) => {
	return (
		<chakra.div position="absolute" right="0" zIndex={6} my="1rem">
			<Flex direction="row" alignItems="center">
				<FormLabel fontSize="sm">Filter by category</FormLabel>
				<Switch
					isChecked={Boolean(checked)}
					onChange={handleSwitchChange}
					colorScheme="teal"
					size="lg"
					value={checked}
				/>
				<FormLabel fontSize="sm" ml="2">
					Visual web mode
				</FormLabel>
			</Flex>
		</chakra.div>
	);
};

export default ModeSwitch;
