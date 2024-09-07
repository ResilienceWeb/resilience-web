'use client'
import Image from 'next/image'
import { Flex, Text, Box, Heading } from '@chakra-ui/react'
import Layout from '@components/layout'
import SignupForm from '@components/signup-form'

export default function NewsItem({ post, contentHtml }) {
  const postDateFormatted = Intl.DateTimeFormat('en-gb', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(post.date))

  return (
    <Layout applyPostStyling>
      <Heading
        as="h1"
        textAlign="center"
        /* @ts-ignore */
        textwrap="pretty"
        mt={{ base: '1rem', md: '1.5rem' }}
      >
        {post.title}
      </Heading>
      <Flex
        justifyContent="center"
        width={{
          base: '90%',
          md: '650px',
        }}
        mt="0.5rem"
        mb={{ base: '1.5rem', md: '1.5rem' }}
      >
        {post.author?.name && (
          <Text fontWeight="600">{post.author.name}&nbsp;•&nbsp;</Text>
        )}
        <Text as="time">{postDateFormatted}</Text>
      </Flex>
      {post.coverImage?.url && (
        <Box
          overflow="hidden"
          position="relative"
          mb="2rem"
          width={{ base: '100vw', md: '850px' }}
          height={{ base: '250px', md: '400px' }}
          borderRadius={{ base: 'none', md: '12px' }}
        >
          <Image
            alt={`Cover image for post: ${post.title}`}
            src={post.coverImage?.url}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 850px"
            style={{
              objectFit: 'cover',
            }}
          />
        </Box>
      )}
      <Box
        maxWidth={{
          base: '90%',
          md: '650px',
        }}
        mb="3rem"
      >
        <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </Box>

      <Box mb="3rem">
        <Text
          fontWeight={600}
          mb={2}
          style={{
            color: 'var(--chakra-colors-rw-900)',
            fontSize: 'var(--chakra-fontSizes-xl)',
          }}
        >
          Sign up to our mailing list to stay up to date
        </Text>
        <SignupForm />
      </Box>
    </Layout>
  )
}
