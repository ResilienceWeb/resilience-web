import fs from 'fs';
import groupBy from 'lodash/groupBy.js';

const IMPORTED_DATA_PATH = './scripts/imported-data.json';

const transform = () => {
	const transformedData = {
		nodes: [],
		edges: [],
	};
	const jsonData = fs.readFileSync(IMPORTED_DATA_PATH);
	const data = JSON.parse(jsonData);
	data.map(({ name, category, website }, index) => {
		transformedData.nodes.push({
			id: index,
			label: name,
			category,
			website,
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
	});

	let categoryIndex = 1;
	for (const category in groupedByCategory) {
		const categoryId = categoryIndex * 1000;
		transformedData.nodes.push({
			id: categoryId,
			label: category,
			color: '#64b37c',
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
