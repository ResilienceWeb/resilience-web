import {
  Container,
  Stack,
  // Heading,
  // Text,
  Button,
  // Center,
  // Box,
  Link,
} from '@chakra-ui/react'
import NextLink from 'next/link'

import { PROTOCOL, REMOTE_HOSTNAME } from '@helpers/config'
import { useWebs } from '@hooks/webs'

const WebCards = () => {
  const { webs } = useWebs()

  return (
    <Container maxW="7xl">
      <Stack spacing={{ base: 4, sm: 6 }}>
        {webs
          ?.filter((web) => web.public)
          .map((web) => (
            <Link
              key={web.id}
              as={NextLink}
              href={`${PROTOCOL}://${web.slug}.${REMOTE_HOSTNAME}`}
              width="fit-content"
            >
              <Button
                rounded="full"
                px={6}
                bg="rw.700"
                colorScheme="rw.700"
                size="lg"
                _hover={{ bg: 'rw.900' }}
              >
                {web.title}
              </Button>
            </Link>
          ))}
      </Stack>
    </Container>
  )
}

export default WebCards

/** Not used yet, realised we need to have the image fields for the webs first */
// const Card = () => {
//   return (
//     <Center py={6}>
//       <Box
//         maxW={'445px'}
//         w={'full'}
//         bg="white"
//         boxShadow={'2xl'}
//         rounded={'md'}
//         p={6}
//         overflow={'hidden'}
//       >
//         <Box
//           h={'210px'}
//           bg={'gray.100'}
//           mt={-6}
//           mx={-6}
//           mb={6}
//           pos={'relative'}
//         >
//           <Image src={''} layout={'fill'} />
//         </Box>
//         <Stack>
//           <Text
//             color={'green.500'}
//             textTransform={'uppercase'}
//             fontWeight={800}
//             fontSize={'sm'}
//             letterSpacing={1.1}
//           >
//             Blog
//           </Text>
//           <Heading color="gray.700" fontSize={'2xl'} fontFamily={'body'}>
//             Boost your conversion rate
//           </Heading>
//           <Text color={'gray.500'}>
//             Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
//             nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam
//             erat, sed diam voluptua. At vero eos et accusam et justo duo dolores
//             et ea rebum.
//           </Text>
//         </Stack>
//         <Stack mt={6} direction={'row'} spacing={4} align={'center'}>
//           <Stack direction={'column'} spacing={0} fontSize={'sm'}>
//             <Text fontWeight={600}>Achim Rolle</Text>
//             <Text color={'gray.500'}>Feb 08, 2021 · 6min read</Text>
//           </Stack>
//         </Stack>
//       </Box>
//     </Center>
//   )
// }

