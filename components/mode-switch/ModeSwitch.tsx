import { chakra, FormLabel, Switch, Flex } from '@chakra-ui/react';

const ModeSwitch = ({ handleSwitchChange, checked }) => {
	return (
		<chakra.div ml={2} mr={2}>
			<Flex
				direction="row"
				alignItems="center"
				justifyContent="center"
				width="200px"
			>
				<FormLabel
					textAlign="center"
					fontSize="sm"
					mr={2}
					mb={0}
					ml={0}
				>
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
				<FormLabel fontSize="sm" ml={2} mb={0} mr={0}>
					Map view
				</FormLabel>
			</Flex>
		</chakra.div>
	);
};

export default ModeSwitch;
