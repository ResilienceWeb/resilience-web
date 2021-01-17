import Graph from 'react-graph-vis';
import PropTypes from 'prop-types';
import { AnimatePresence, motion } from 'framer-motion';

import InfoBox from '../info-box';
import styles from './Network.module.scss';

const options = {
	nodes: {
		shape: 'box',
		size: 34,
		font: {
			size: 28,
		},
		shadow: {
			enabled: true,
		},
		// shapeProperties: {
		// 	interpolation: false,
		// },
	},
	edges: {
		color: '#000000',
		arrows: {
			to: {
				enabled: false,
			},
		},
	},
	// physics: {
	// 	forceAtlas2Based: {
	// 		avoidOverlap: 0.3,
	// 		gravitationalConstant: -26,
	// 		centralGravity: 0.005,
	// 		springLength: 100,
	// 		springConstant: 0.08,
	// 	},
	// 	maxVelocity: 106,
	// 	solver: 'forceAtlas2Based',
	// 	timestep: 0.35,
	// 	stabilization: {
	// 		enabled: true,
	// 		iterations: 1000,
	// 		updateInterval: 100,
	// 		onlyDynamicEdges: false,
	// 		fit: true,
	// 	},
	// },
	physics: {
		forceAtlas2Based: {
			gravitationalConstant: -26,
			centralGravity: 0.005,
			springLength: 230,
			springConstant: 0.18,
		},
		maxVelocity: 146,
		solver: 'repulsion',
		timestep: 0.35,
		stabilization: { iterations: 150 },
		repulsion: {
			nodeDistance: 300,
			springLength: 250,
		},
	},
	interaction: {
		zoomView: true,
		hover: true,
		dragView: false,
		navigationButtons: true,
	},
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

	// TODO: useMemo
	const selectedItem = data.nodes.find((node) => node.id === selectedId);

	return (
		<div className={styles.graph}>
			<Graph
				events={events}
				getNetwork={(network) => setNetwork(network)}
				graph={data}
				options={options}
			/>
			<AnimatePresence>
				{selectedId && (
					<motion.div
						key="infobox"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
					>
						<InfoBox title={selectedItem.label} />
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

Network.propTypes = {
	data: PropTypes.object.isRequired,
	selectedId: PropTypes.string,
	setSelectedId: PropTypes.func.isRequired,
	setNetwork: PropTypes.func.isRequired,
};

export default Network;
