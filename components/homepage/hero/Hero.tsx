import { Container, Stack, Heading, Text } from '@chakra-ui/react'

export default function Hero() {
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
              Celebrating place-based community{' '}
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
