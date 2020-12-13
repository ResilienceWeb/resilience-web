import { useState } from 'react';
import Graph from 'react-graph-vis';
import { AnimatePresence, motion } from 'framer-motion';

import InfoBox from '../info-box';
import styles from './Network.module.scss';
import data from './data.js';

const Node = {
	comres: 'Community Resilience and Regeneration',
	transition: 'Transition Cambridge',
	ccf: 'Cambridge Carbon Footprint',
	waterland: 'Waterland Organics',
	smartercamtransport: 'Smarter Cambridge Transport',
	repaircafes: 'Repair Cafes (Jointly with CCF)',
	cafenights: 'Cafe nights with talks & activities',
	energygroup: 'Energy Group',
	emptycommon: 'Empty Common Community Garden',
	growingspaces: 'Growing Spaces',
	romseytowngarden: 'Romsey Town Community Garden',
	cropshare: 'Crop Share',
};

const graphData = [
	[Node.comres, Node.transition],
	[Node.transition, Node.smartercamtransport],
	[Node.transition, Node.repaircafes],
	[Node.transition, Node.cafenights],
	[Node.transition, Node.energygroup],
	[Node.transition, Node.emptycommon],
	[Node.transition, Node.growingspaces],
	[Node.transition, Node.romseytowngarden],
	[Node.transition, Node.cropshare],
	[Node.comres, Node.ccf],
	[Node.comres, Node.waterland],
	[Node.comres, 'Italic'],
	[Node.comres, 'Hellenic'],
	[Node.comres, 'Anatolian'],
	[Node.comres, 'Indo-Iranian'],
	[Node.comres, 'Tocharian'],
	['Indo-Iranian', 'Dardic'],
	['Indo-Iranian', 'Indic'],
	['Indo-Iranian', 'Iranian'],
	['Iranian', 'Old Persian'],
	['Old Persian', 'Middle Persian'],
	['Indic', 'Sanskrit'],
	['Italic', 'Osco-Umbrian'],
	['Italic', 'Latino-Faliscan'],
	['Latino-Faliscan', 'Latin'],
	['Celtic', 'Brythonic'],
	['Celtic', 'Goidelic'],
];

var options = {
	nodes: {
		shape: 'box',
		size: 26,
		font: {
			size: 18,
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
