import { useRouter } from 'next/router'

export default function Custom404() {
    const router = useRouter()

    void router.replace('/')

    return <h1>404 - Page Not Found</h1>
}

