import { useState } from 'react';
import Graph from 'react-graph-vis';
import { AnimatePresence, motion } from 'framer-motion';

import InfoBox from '../info-box';
import styles from './Network.module.scss';
import data from './data.js';

var options = {
	nodes: {
		shape: 'box',
		size: 26,
		font: {
			size: 24,
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
		color: {},
	},
	physics: {
		forceAtlas2Based: {
			avoidOverlap: 0.3,
			gravitationalConstant: -26,
			centralGravity: 0.005,
			springLength: 100,
			springConstant: 0.08,
		},
		maxVelocity: 106,
		solver: 'forceAtlas2Based',
		timestep: 0.35,
		stabilization: {
			enabled: true,
			iterations: 1000,
			updateInterval: 100,
			onlyDynamicEdges: false,
			fit: true,
		},
	},
	interaction: {
		zoomView: false,
		hover: true,
	},
	layout: {
		improvedLayout: false,
	},
	height: '100%',
};

const Network = () => {
	const [selectedId, setSelectedId] = useState();

	const events = {
		select: function (event) {
			var { nodes, edges } = event;
			console.log(event);
			setSelectedId(nodes[0]);
		},
		showPopup: function (event) {
			console.log('show popup?');
		},
	};

	const selectedItem = data.nodes.find((node) => node.id === selectedId);

	return (
		<div className={styles.graph}>
			<Graph events={events} graph={data} options={options} />
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

export default Network;
