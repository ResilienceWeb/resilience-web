import { memo } from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import { REMOTE_URL } from '@helpers/config';
import Layout from '@components/layout';
import ListingDisplay from '@components/listing';

function Listing({ listing }) {
    const router = useRouter();
    if (router.isFallback) {
        return (
            <Layout>
                <h1>Please wait…</h1>
            </Layout>
        );
    }

    return (
        <>
            <NextSeo
                title={`${listing.title} | Cambridge Resilience Web`}
                openGraph={{
                    title: `${listing.title} | Cambridge Resilience Web`,
                    images: [{ url: listing.image }],
                }}
            />
            <Layout>
                <ListingDisplay listing={listing} />
            </Layout>
        </>
    );
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const response = await fetch(`${REMOTE_URL}/api/listing/${params.slug}`);
    const data = await response.json();
    const { listing } = data;

    return {
        props: {
            listing,
        },
        revalidate: 5,
    };
};

export const getStaticPaths: GetStaticPaths = async () => {
    const response = await fetch(`${REMOTE_URL}/api/listings`);
    const data = await response.json();
    const { listings } = data;
    const paths = listings.map((l) => `/city/${l.slug}`);

    return {
        paths,
        fallback: true,
    };
};

export default memo(Listing);

