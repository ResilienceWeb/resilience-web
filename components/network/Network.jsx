import { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { AnimatePresence, motion } from 'framer-motion';
import VisNetworkReactComponent from 'vis-network-react';

import InfoBox from '../info-box';
import styles from './Network.module.scss';

const options = {
	nodes: {
		shape: 'box',
		shapeProperties: {
			borderRadius: 3,
		},
		size: 44,
		font: {
			size: 56,
		},
		margin: 16,
		shadow: {
			enabled: true,
		},
		borderWidthSelected: 10,
		color: {
			border: '#2B7CE9',
			background: '#97C2FC',
			highlight: {
				border: '#467354',
				background: '#64b37c',
			},
			hover: {
				border: '#2B7CE9',
				background: '#D2E5FF',
			},
		},
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
		enabled: true,
		repulsion: {
			nodeDistance: 300,
			springLength: 250,
			// centralGravity: 0.02,
			// springConstant: 0.01,
		},
		maxVelocity: 146,
		solver: 'repulsion',
		stabilization: {
			enabled: true,
			iterations: 1000,
			// updateInterval: 5,
			fit: true,
		},
		timestep: 0.1,
		// adaptiveTimestep: true,
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
	// manipulation: {
	// 	enabled: true,
	// },
	layout: {
		improvedLayout: false,
	},
	height: '100%',
};

const Network = ({ data, selectedId, setSelectedId, setNetwork }) => {
	const events = {
		select: function (event) {
			const { nodes, edges } = event;
			// console.log(event);
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
			<AnimatePresence>
				{selectedId && !selectedItem?.isDescriptive && (
					<motion.div
						key="infobox"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
					>
						<InfoBox
							title={selectedItem.label}
							website={selectedItem.website}
						/>
					</motion.div>
				)}
			</AnimatePresence>
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
