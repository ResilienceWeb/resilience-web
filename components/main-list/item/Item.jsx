import React from 'react';
import { chakra, Flex } from '@chakra-ui/react';

const Item = ({ dataItem }) => {
	return (
		<chakra.div
			py={4}
			px={3}
			my={2}
			cursor="pointer"
			border="1px solid #c7c5c5"
			borderRadius="5px"
		>
			<Flex justifyContent="space-between">
				<chakra.h2
					fontSize={17}
					fontWeight={700}
					style={{ color: '#454545', marginBottom: 0 }}
				>
					{dataItem.label}
				</chakra.h2>
				<chakra.div fontSize={14} color="#a0a0a0">
					{dataItem.category}
				</chakra.div>
			</Flex>
		</chakra.div>
	);
};

export default Item;
