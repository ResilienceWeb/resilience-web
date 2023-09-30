import { useState, useRef } from 'react'
import { useInterval } from 'usehooks-ts'
import { motion, useAnimation, useInView } from 'framer-motion'
import { Container, Stack, Heading, Text } from '@chakra-ui/react'

const word = {
  hidden: {
    opacity: 1,
    transition: {
      duration: 3.0,
    },
  },
  visible: {
    opacity: 1,
    transition: {
      delay: 0.5,
      staggerChildren: 0.05,
    },
  },
}

const letter = {
  hidden: {
    opacity: 0,
    y: 50,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
}

const wordsToDisplay = [
  'Celebrating',
  'Encouraging',
  'Galvanising',
  'Uplifting',
]

export default function Hero() {
  const [wordIndex, setWordIndex] = useState(0)
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref)

  useInterval(() => {
    const nextIndex =
      wordIndex === wordsToDisplay.length - 1 ? 0 : wordIndex + 1
    setWordIndex(nextIndex)

    if (isInView) {
      controls.start('visible')
    } else {
      controls.start('hidden')
    }
  }, 5000)

  return (
    <>
      <Container maxW="7xl" mt="1rem">
        <Stack
          align="center"
          spacing={{ base: 8, md: 4 }}
          py={{ base: '0', md: '1rem' }}
          direction={{ base: 'column', md: 'row' }}
        >
          <Stack
            spacing={{ base: 5, md: 8 }}
            display="flex"
            alignItems={{ base: 'left', md: 'center' }}
          >
            <Heading
              fontWeight={600}
              fontSize={{ base: '42px', md: '52px' }}
              lineHeight={1.2}
              width={{ base: '100%', md: '90%', lg: '70%' }}
              wordBreak="break-word"
              textAlign={{ base: 'left', md: 'center' }}
            >
              <motion.span
                variants={word}
                initial="hidden"
                animate="visible"
                ref={ref}
                key={wordsToDisplay[wordIndex]}
              >
                {wordsToDisplay[wordIndex].split('').map((char, index) => {
                  return (
                    <motion.span key={`${char}-${index}`} variants={letter}>
                      {char}
                    </motion.span>
                  )
                })}
              </motion.span>{' '}
              <span>place-based community </span>
              <Text
                as="span"
                fontWeight={600}
                fontSize={{ base: '42px', md: '52px' }}
                lineHeight={1.2}
                width="fit-content"
                wordBreak="break-word"
                textAlign={{ base: 'left', md: 'center' }}
                position="relative"
                zIndex={1}
                _after={{
                  content: "''",
                  width: 'full',
                  height: '25%',
                  position: 'absolute',
                  bottom: 1,
                  left: 0,
                  bg: 'rw.700',
                  zIndex: -1,
                }}
              >
                action
              </Text>
            </Heading>
            <Text
              color="blackAlpha.700"
              fontSize="18"
              maxW="3xl"
              wordBreak="break-word"
              textAlign={{ base: 'left', md: 'center' }}
            >
              A Resilience Web is a holistic visualisation of environmental and
              social justice groups in a place, curated by people who live
              there. These webs are intended to help the discovery,
              collaboration and networking between activists and groups around
              issues that they care about.
            </Text>
            <Text color="blackAlpha.700" fontSize="18" maxW="3xl">
              Be part of a growing movement of positive change...
            </Text>
          </Stack>
        </Stack>
      </Container>
    </>
  )
}
