import { memo, useEffect } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { Heading, Center, Spinner } from '@chakra-ui/react'

import type { GetStaticPaths, GetStaticProps } from 'next'
import type { ParsedUrlQuery } from 'querystring'

import { useAppContext } from '@store/hooks'

const Drawer = dynamic(() => import('@components/drawer'), {
  ssr: false,
})
const Header = dynamic(() => import('@components/header'), {
  ssr: false,
})

interface PathProps extends ParsedUrlQuery {
  web: string
}

interface WebProps {
  data: {
    nodes: any[]
    edges: any[]
  }
}

const CtrlShiftWeb = () => {
  const router = useRouter()

  const { isMobile } = useAppContext()

  useEffect(() => {
    const fetchSurvey = async () => {
      const result = await fetch('https://marketplace.humhub.com/api/v1/survey')
      console.log(result)
    }

    void fetchSurvey()
  }, [])

  if (router.isFallback) {
    return (
      <Center height="100vh">
        <Spinner size="xl" />
      </Center>
    )
  }

  return (
    <>
      <Heading>Ctrl-Shift</Heading>
    </>
  )
}

export const getStaticProps: GetStaticProps<WebProps, PathProps> = async () => {
  // const result = await fetch(
  //   'https://marketplace.humhub.com/api/v1/survey/6/answers',
  // )
  // console.log(result)

  return {
    props: {
      data: {
        nodes: [],
        edges: [],
      },
      selectedWebName: 'Ctrl Shift',
    },
    revalidate: 30,
  }
}

export default memo(CtrlShiftWeb)

