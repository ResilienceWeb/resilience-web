import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const locationCity = {
    title: 'Cambridge City',
    slug: 'cambridge-city',
}
const locationUni = {
    title: 'University of Cambridge',
    slug: 'cambridge-university',
}

const categoriesCity = [
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
]

const categoriesUni = [
    {
        label: 'Policy',
        color: '000000',
    },
    {
        label: 'Infrastructure',
        color: 'ff5757',
    },
]

const listingsCity = [
    {
        title: 'Cambridge Community Kitchen',
        slug: 'cambridge-community-kitchen',
        description:
            'We are a food solidarity collective tackling food poverty in Cambridge by offering free, hot, plant-based meals to those who need them every Tuesday, Thursday and Sunday.',
    },
]

const listingsUni = [
    {
        title: 'Conservation Research Institute',
        slug: 'conservation-research-institute',
    },
]

async function main() {
    const newLocationCity = await prisma.location.create({
        data: locationCity,
    })

    categoriesCity.forEach(async (category) => {
        await prisma.category.create({
            data: {
                ...category,
                locationId: newLocationCity.id,
            },
        })
    })

    const newLocationUni = await prisma.location.create({
        data: locationUni,
    })
    categoriesUni.forEach(async (category) => {
        await prisma.category.create({
            data: {
                ...category,
                locationId: newLocationUni.id,
            },
        })
    })

    listingsCity.forEach(async (listing) => {
        const newCategory = await prisma.category.findFirst({
            where: {
                locationId: newLocationCity.id,
            },
        })

        await prisma.listing.create({
            data: {
                ...listing,
                locationId: newLocationCity.id,
                categoryId: newCategory.id,
            },
        })
    })

    setTimeout(() => {
        listingsUni.forEach(async (listing) => {
            const newCategory = await prisma.category.findFirst({
                where: {
                    locationId: newLocationUni.id,
                },
            })

            await prisma.listing.create({
                data: {
                    ...listing,
                    locationId: newLocationUni.id,
                    categoryId: newCategory.id,
                },
            })
        })
    }, 1000)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

