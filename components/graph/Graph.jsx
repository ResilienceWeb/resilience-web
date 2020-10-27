import React from 'react';
import Highcharts from 'highcharts';
import addNetworkGraphModule from 'highcharts/modules/networkgraph';
import HighchartsReact from 'highcharts-react-official';

const Node = {
	comres: 'Community Resilience and Regeneration',
	transition: 'Transition Cambridge',
	ccf: 'Cambridge Carbon Footprint',
	waterland: 'Waterland Organics',
};

const graphData = [
	[Node.comres, Node.transition],
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

const options = {
	title: {
		text: 'Cambridge - Community Resilience and Regeneration',
	},
	series: [
		{
			type: 'networkgraph',
			data: graphData,
			marker: {
				radius: 20,
			},
			dataLabels: {
				enabled: true,
				linkFormat: '',
				allowOverlap: false,
			},
		},
	],
	plotOptions: {
		networkgraph: {
			keys: ['from', 'to'],
			layoutAlgorithm: {
				enableSimulation: true,
				// integration: 'verlet',
				approximation: 'barnes-hut',
				// gravitationalConstant: 0.8,
				// linkLength: 100,
			},
		},
	},
};

const Graph = () => {
	addNetworkGraphModule(Highcharts);

	return (
		<HighchartsReact
			allowChartUpdate={false}
			highcharts={Highcharts}
			immutable
			options={options}
		/>
	);
};

export default Graph;
