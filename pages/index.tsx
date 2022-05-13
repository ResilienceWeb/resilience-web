import Layout from '@components/layout'
import Hero from '@components/homepage/hero'
import JoinTheCommunity from '@components/homepage/join-the-community'

export default function Homepage() {
    return (
        <Layout>
            <Hero />
            <JoinTheCommunity />
        </Layout>
    )
}
