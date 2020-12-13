import dynamic from 'next/dynamic';
const NoSSRGraph = dynamic(() => import('../components/network'), {
	ssr: false,
});

export default function Home() {
	return <NoSSRGraph />;
}
