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

  // useEffect(() => {
  //   const fetchSurvey = async () => {
  //     const result = await fetch(
  //       'https://marketplace.humhub.com/api/v1/survey',
  //       {
  //         headers: {
  //           Authentication:
  //             'Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjY3MH0.qPEf2Jy9_lM3mRIQXPpNfZz-ayGX7PJtr6ZeBVGzkHYRz3KWtclLwwWK-UUOb0TzRWZ3UmXklK83TxkHqVIgQA',
  //         },
  //       },
  //     )
  //     console.log(result)
  //   }

  //   void fetchSurvey()
  // }, [])

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
  const result = await fetch(
    'https://vive.transitiontogether.org.uk/api/v1/survey/6',
    {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        Authorization:
          'Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjY3MH0.qPEf2Jy9_lM3mRIQXPpNfZz-ayGX7PJtr6ZeBVGzkHYRz3KWtclLwwWK-UUOb0TzRWZ3UmXklK83TxkHqVIgQA',
      },
    },
  )
  console.log(result)

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

