import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()

const categories = [
	{
		label: 'Environment',
		color: '7ed957',
	},
	{
		label: 'Housing',
		color: 'cb6ce6',
	},
	{
		label: 'Social business',
		color: '778ffc',
	},
	{
		label: 'Transportation',
		color: '737373',
	},
	{
		label: 'Connectivity',
		color: '5ce1e6',
	},
	{
		label: 'Community',
		color: 'ff66c4',
	},
	{
		label: 'Animal rights',
		color: '008037',
	},
	{
		label: 'Social justice',
		color: 'ff5757',
	},
];


async function main() {
	categories.forEach(async (category) => {
		const cat = await prisma.category.create({
			data: category,
		});
	});
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
