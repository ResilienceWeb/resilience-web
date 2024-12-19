import { useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import posthog from 'posthog-js'
import {
  chakra,
  Heading,
  Text,
  Button,
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  FormHelperText,
  Input,
  InputGroup,
  InputRightAddon,
  Textarea,
} from '@chakra-ui/react'
import { Formik, Form, Field, FieldProps, useFormikContext } from 'formik'
import LogoImage from '../../../public/logo.png'
import { fieldRequiredValidator, urlValidator } from '@helpers/formValidation'
import useCreateWeb from '@hooks/webs/useCreateWeb'
import { generateSlug } from '@helpers/utils'
import Faq from '@components/faq'

const faqs = [
  {
    question: '🌱 What is a Resilience Web?',
    answer:
      'A Resilience Web is a digital mapping of environmental and social justice groups in a place, curated by people who live there. These webs are intended to help the discovery, collaboration and networking between activists and groups around issues that they care about.',
  },
  {
    question: '💵 How much does it cost to use the platform?',
    answer: (
      <Text>
        It's completely free! However we rely on grants, the hard work of
        volunteers and donations from people like you. If you can support the
        project with as little as £3/month we would be hugely grateful. Go to{' '}
        <a href="https://opencollective.com/resilience-web">
          {' '}
          our Open Collective
        </a>{' '}
        to donate.
      </Text>
    ),
  },
  {
    question: '❓ I have some questions',
    answer: (
      <Text>
        Get in touch with us anytime via the button at the top right of the
        page. We are happy to set up a call to take you through what the
        platform can offer and listen to your feedback if you have any. You
        might also find the answer to your questions in{' '}
        <a href="https://resilienceweb.gitbook.io/knowledgebase">
          our Knowledgebase
        </a>
        .
      </Text>
    ),
  },
]

const SlugField = () => {
  const {
    values: { title },
    setFieldValue,
  } = useFormikContext<any>()

  useEffect(() => {
    const generatedSlug = generateSlug(title)

    if (title.trim() !== '') {
      setFieldValue('slug', generatedSlug)
    }
  }, [setFieldValue, title])

  return (
    <Field name="slug" validate={urlValidator}>
      {({ field, form }: FieldProps) => {
        return (
          <FormControl
            isInvalid={Boolean(form.errors.slug && form.touched.slug)}
          >
            <FormLabel htmlFor="slug" fontSize="sm" fontWeight="600">
              Link to web
            </FormLabel>
            <InputGroup size="sm">
              <Input
                {...field}
                id="slug"
                fontSize="sm"
                shadow="sm"
                size="sm"
                rounded="md"
                placeholder="e.g. york"
              />
              <InputRightAddon
                bg="gray.50"
                color="gray.500"
                rounded="md"
                userSelect="none"
              >
                {`.resilienceweb.org.uk`}
              </InputRightAddon>
            </InputGroup>
            <FormErrorMessage>{form.errors.slug?.toString()}</FormErrorMessage>
            <FormHelperText>
              This will form part of the link to your web, e.g.
              york.resilienceweb.org.uk
            </FormHelperText>
          </FormControl>
        )
      }}
    </Field>
  )
}

const WebCreation = () => {
  const { createWeb, isPending, isSuccess, isError, errorMessage } =
    useCreateWeb()
  const router = useRouter()

  useEffect(() => {
    posthog.capture('web-creation-start')
  }, [])

  useEffect(() => {
    if (isSuccess) {
      router.push('/admin?firstTime=true')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess])

  const onSubmit = useCallback(
    (data) => {
      createWeb({
        ...data,
      })
    },
    [createWeb],
  )

  return (
    <>
      <Box display="flex" justifyContent="center" mb="2rem">
        <Image alt="Resilience Web CIC logo" src={LogoImage} />
      </Box>
      <Heading as="h1">Welcome 👋</Heading>
      <Text mt="1rem">
        You are taking the first steps in setting up a Resilience Web for your
        area, well done! Once you fill out the details below, you will be able
        to start adding listings, inviting collaborators to your team and so
        much more.
      </Text>
      <Box
        shadow="base"
        rounded={[null, 'md']}
        overflow={{ sm: 'hidden' }}
        bg="white"
        padding="1rem"
        mt="1rem"
      >
        <Formik
          initialValues={{
            title: '',
            slug: '',
            description: '',
          }}
          enableReinitialize
          onSubmit={onSubmit}
        >
          {(_props) => {
            return (
              <Form>
                <chakra.div mb={3}>
                  <Field
                    name="title"
                    type="title"
                    validate={fieldRequiredValidator}
                  >
                    {({ field, form }: FieldProps) => (
                      <FormControl isInvalid={Boolean(form.errors.title)}>
                        <FormLabel htmlFor="title" fontWeight="600">
                          Web title
                        </FormLabel>
                        <Input
                          {...field}
                          id="title"
                          background="white"
                          fontSize="sm"
                          shadow="sm"
                          size="sm"
                          rounded="md"
                          placeholder="e.g. York"
                        />
                        <FormErrorMessage>
                          {form.errors.title?.toString()}
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                </chakra.div>

                <chakra.div mb={3} maxW="500px">
                  <SlugField />
                </chakra.div>

                <chakra.div mb="2rem">
                  <Field name="description" type="text">
                    {({ field, form }: FieldProps) => (
                      <FormControl
                        isInvalid={Boolean(
                          form.errors.description && form.touched.description,
                        )}
                      >
                        <FormLabel
                          htmlFor="description"
                          fontSize="sm"
                          fontWeight="600"
                        >
                          Description (optional)
                        </FormLabel>
                        <Textarea
                          {...field}
                          id="description"
                          fontSize="sm"
                          shadow="sm"
                          size="sm"
                          rounded="md"
                        />
                        <FormErrorMessage>
                          {form.errors.description?.toString()}
                        </FormErrorMessage>
                        <FormHelperText>
                          This can also be edited later.
                        </FormHelperText>
                      </FormControl>
                    )}
                  </Field>
                </chakra.div>

                {isError && errorMessage && (
                  <Text color="red.500" fontSize="0.875rem">
                    {`${errorMessage}`}
                  </Text>
                )}

                <Button mt={4} variant="rw" isLoading={isPending} type="submit">
                  Get started
                </Button>
              </Form>
            )
          }}
        </Formik>
      </Box>

      <Box mt="4rem" mb="2rem">
        <Heading as="h3" fontSize="1.5rem" mb="1rem">
          Need help?
        </Heading>
        <Faq content={faqs} />
      </Box>
    </>
  )
}

export default WebCreation
