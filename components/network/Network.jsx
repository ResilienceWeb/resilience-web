import { memo, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import VisNetworkReactComponent from 'vis-network-react';
import { chakra, Flex, Tag, useDisclosure } from '@chakra-ui/react';

import Dialog from '../main-list/dialog';
import InfoBox from '@components/info-box';
import styles from './Network.module.scss';

const options = {
	nodes: {
		shape: 'box',
		shapeProperties: {
			borderRadius: 3,
		},
		size: 32,
		font: {
			size: 26,
		},
		margin: 10,
		shadow: {
			enabled: true,
		},
		borderWidthSelected: 2,
	},
	edges: {
		color: '#000000',
		arrows: {
			to: {
				enabled: false,
			},
		},
	},
	physics: {
		forceAtlas2Based: {
			gravitationalConstant: -26,
			centralGravity: 0.005,
			springLength: 230,
			springConstant: 0.18,
		},
		maxVelocity: 146,
		solver: 'forceAtlas2Based',
		stabilization: {
			enabled: true,
			iterations: 150,
			fit: true,
		},
		timestep: 0.35,
	},
	interaction: {
		zoomView: true,
		hover: true,
		dragView: false,
		navigationButtons: true,
		keyboard: {
			enabled: true,
			bindToWindow: true,
		},
	},
	layout: {
		improvedLayout: false,
	},
	height: '100%',
};

const Network = ({ data, selectedId, setSelectedId, setNetwork }) => {
	const { isOpen, onOpen, onClose } = useDisclosure();

	useEffect(() => {
		if (selectedId) {
			onOpen();
		}
	}, [onOpen, selectedId]);

	const events = {
		select: function (event) {
			const { nodes, edges } = event;
			setSelectedId(nodes[0]);
		},
		showPopup: function (event) {
			console.log('show popup?');
		},
	};

	const selectedItem = useMemo(
		() => data.nodes.find((node) => node.id === selectedId),
		[data.nodes, selectedId],
	);

	return (
		<div className={styles.graph}>
			<VisNetworkReactComponent
				events={events}
				getNetwork={(network) => setNetwork(network)}
				data={data}
				options={options}
			/>
			{Boolean(selectedId) && !selectedItem?.isDescriptive && (
				<Dialog isOpen={isOpen} item={selectedItem} onClose={onClose} />
			)}
		</div>
	);
};

Network.propTypes = {
	data: PropTypes.object.isRequired,
	selectedId: PropTypes.number,
	setSelectedId: PropTypes.func.isRequired,
	setNetwork: PropTypes.func.isRequired,
};

export default memo(Network);
