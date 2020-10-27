import dynamic from 'next/dynamic';
const NoSSRGraph = dynamic(() => import('../components/graph'), {
	ssr: false,
});

export default function Home() {
	return <NoSSRGraph />;
}
