import { gql, GraphQLClient } from 'graphql-request';
import groupBy from 'lodash/groupBy';
import CATEGORY_MAPPING from '../../../data/enums.js';

const graphcmsMutationClient = new GraphQLClient(process.env.GRAPHCMS_URL, {
	headers: {
		Authorization: `Bearer ${process.env.GRAPHCMS_MUTATION_TOKEN}`,
	},
});

const startsWithCapitalLetter = (word) =>
	word.charCodeAt(0) >= 65 && word.charCodeAt(0) <= 90;

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

let REMOTE_URL = '';
if (process.env.NODE_ENV === 'development') {
	REMOTE_URL = 'http://localhost:3000';
} else {
	REMOTE_URL = 'https://cambridgeresilienceweb.org.uk';
}

export default async (req, res) => {
	try {
		const listingsInDb = await fetch(`${REMOTE_URL}/api/listings`);

		const data = await listingsInDb.json();
		const { listings } = data;

		const transformedData = {
			nodes: [],
			edges: [],
		};
		listings.map(
			({
				id,
				title,
				category,
				description,
				website,
				facebook,
				twitter,
				instagram,
				email,
			}) => {
				transformedData.nodes.push({
					id,
					label: title,
					category,
					description,
					website,
					facebook,
					twitter,
					instagram,
					email,
					color: COLOR_MAPPING[category] ?? 'black',
				});
			},
		);

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

		const response = await graphcmsMutationClient.request(
			gql`
				mutation updateData($newData: Json) {
					updateListingGroup(
						where: { identifier: "cambridge-city" }
						data: { data: $newData }
					) {
						data
					}
					publishListingGroup(
						where: { identifier: "cambridge-city" }
					) {
						data
						stage
					}
				}
			`,
			{
				newData: transformedData,
			},
		);

		res.status(201).json({ response });
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error(error);
		res.status(500).json({
			status: 500,
			message: 'There was a problem updating the remote data!',
		});
	}
};
