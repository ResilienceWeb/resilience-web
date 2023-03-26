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

const relevantFieldIds = [
  30, // Organisation
  35, // Aims and objectives
  104, // Organisation website
]

const transformData = (answers) => {
  console.log(answers)
  const visibleAnswers = answers.filter((answer) => answer.state === 'visible')

  const transformedData = visibleAnswers.map((answer) => {
    relevantFieldIds.map((fieldId) => {
      return answer.answerFields.find((field) => field.field_id === fieldId)
    })
  })

  return visibleAnswers
}

const CtrlShiftWeb = ({ surveyAnswers }) => {
  const router = useRouter()

  const answers = transformData(surveyAnswers)
  // console.log(surveyAnswers)

  const { isMobile } = useAppContext()

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
  const response = await fetch(
    'https://vive.transitiontogether.org.uk/api/v1/survey/6/answers',
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization:
          'Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjY3MH0.qPEf2Jy9_lM3mRIQXPpNfZz-ayGX7PJtr6ZeBVGzkHYRz3KWtclLwwWK-UUOb0TzRWZ3UmXklK83TxkHqVIgQA',
      },
    },
  )
  const data = await response.json()
  console.log(data.results)

  return {
    props: {
      data: {
        nodes: [],
        edges: [],
      },
      surveyAnswers: data.results,
      selectedWebName: 'Ctrl Shift',
    },
    revalidate: 30,
  }
}

export default memo(CtrlShiftWeb)

