import { useRouter } from 'next/router'

const useRemoteUrl = () => {
  const router = useRouter()

  const { pathname, isPreview, basePath, asPath } = router

  console.log({ pathname, isPreview, basePath, asPath })

  // if (isPreview) {
  //   return basePath
  // }

  return process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://resilienceweb.org.uk'
}

export default useRemoteUrl

