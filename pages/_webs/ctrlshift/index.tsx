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

const relevantFields = {
  'organisation': 30,
  'aims-and-objectives': 35,
  'website': 104
}

const getField = (fieldKey, answer) => {
  return answer.answerFields.find((field) => field.field_id === relevantFields[fieldKey]).value
}

const transformData = (allAnswers) => {
  const answers = allAnswers.filter((answer) => answer.state === 'visible')

  return answers.map((answer) => {
    return {
      title: getField('organisation', answer),
      description: getField('aims-and-objectives', answer),
      website: getField('website', answer)
    }
  })
}

const CtrlShiftWeb = ({ surveyAnswers }) => {
  const router = useRouter()

  const answers = transformData(surveyAnswers)
  console.log(answers)

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

