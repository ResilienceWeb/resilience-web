import fs from 'fs';
import groupBy from 'lodash/groupBy.js';

const IMPORTED_DATA_PATH = './scripts/imported-data.json';

const COLOR_MAPPING = {
	Environment: '#7ed957',
	Housing: '#cb6ce6',
	'Social business': '#778ffc',
	Transportation: '#737373',
	Connectivity: '#5ce1e6',
	Equity: '#ff66c4',
	Community: '#ffde59',
	'Community garden': '#2cb868',
	'Animal rights': '#ff914d',
	Nature: '#008037',
	'Social justice': '#ff5757',
	Education: '#c9e265',
	Food: '#a4791b',
	Technology: '#a2b342',
	Art: '#77fcd0',
	Union: '#fff780',
};

const CATEGORY_MAPPING = {
	Environment: 'Environment',
	Housing: 'Housing',
	'Social business': 'Social business',
	Transportation: 'Transportation',
	Connectivity: 'Connectivity',
	Equity: 'Equity',
	Community: 'Community',
	'Animal rights': 'Animal rights',
	Nature: 'Nature/Conservation',
	Justice: 'Justice',
	Education: 'Education',
	Food: 'Food',
	Technology: 'Technology',
	Art: 'Art',
	Union: 'Union',
	'Social justice': 'Social justice',
	'Community garden': 'Community garden',
};

const transform = () => {
	const transformedData = {
		nodes: [],
		edges: [],
	};
	const jsonData = fs.readFileSync(IMPORTED_DATA_PATH);
	const data = JSON.parse(jsonData);
	data.map(({ name, category, description, website }, index) => {
		transformedData.nodes.push({
			id: index,
			label: name,
			category,
			description,
			website,
			color: COLOR_MAPPING[category] ?? 'black',
		});
	});

	let groupedByCategory = groupBy(transformedData.nodes, 'category');

	groupedByCategory = Object.fromEntries(
		Object.entries(groupedByCategory).filter(([key, value]) => {
			return (
				key.length > 0 &&
				key !== 'undefined' &&
				startsWithCapitalLetter(key)
			);
		}),
	);

	// Main node
	transformedData.nodes.push({
		id: 999,
		label: 'Cambridge Resilience Web',
		color: '#fcba03',
		isDescriptive: true,
		font: {
			size: 46,
		},
	});

	let categoryIndex = 1;
	for (const category in groupedByCategory) {
		const categoryId = categoryIndex * 1000;
		transformedData.nodes.push({
			id: categoryId,
			label: CATEGORY_MAPPING[category],
			color: '#c3c4c7',
			isDescriptive: true,
		});
		categoryIndex++;

		// From main node to category node
		transformedData.edges.push({
			from: 999,
			to: categoryId,
			length: 2000,
		});

		// From category node to all subitems
		groupedByCategory[category].map((item) => {
			transformedData.edges.push({
				from: categoryId,
				to: item.id,
			});
		});
	}

	const stringData = JSON.stringify(transformedData);
	fs.writeFile(
		'./data/data.js',
		`const data = ${stringData}; export default data;`,
		(err) => {
			if (!err) {
				console.log('DONE');
			} else {
				console.error(err);
			}
		},
	);

	fs.unlink(IMPORTED_DATA_PATH, (err) => {
		if (err) {
			throw err;
		}
		console.log('Temporary file deleted.');
	});
};

const startsWithCapitalLetter = (word) =>
	word.charCodeAt(0) >= 65 && word.charCodeAt(0) <= 90;

transform();
