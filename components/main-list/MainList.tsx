import { memo, useMemo } from 'react'
import NextLink from 'next/link'
import { AnimatePresence } from 'framer-motion'
import { chakra, Flex, Grid, Center, Button, Text } from '@chakra-ui/react'

import useCategoriesPublic from '@hooks/categories/useCategoriesPublic'
import useSelectedWebSlug from '@hooks/application/useSelectedWebSlug'
import Footer from '@components/footer'
import Item from './item'

const MainList = ({ filteredItems }) => {
  const selectedWebSlug = useSelectedWebSlug()
  const { categories } = useCategoriesPublic({ webSlug: selectedWebSlug })
  const categoriesIndexes = useMemo(() => {
    const categoriesIndexesObj = {}
    categories?.map((c, i) => (categoriesIndexesObj[c.label] = i))

    return categoriesIndexesObj
  }, [categories])

  return (
    <>
      <Flex
        alignItems="center"
        flexDirection="column"
        minHeight="calc(100vh - 302px)"
        py="1rem"
        px={{ base: '1rem', md: '2rem' }}
      >
        <chakra.div marginTop={4} width="100%" maxW="1400px">
          {filteredItems.length > 0 ? (
            <Grid
              templateColumns={{
                base: '1fr',
                md: 'repeat(3, 1fr)',
              }}
              gap="1rem"
            >
              <AnimatePresence>
                {filteredItems.map((item) => (
                  <Item
                    categoriesIndexes={categoriesIndexes}
                    dataItem={item}
                    key={item.id}
                  />
                ))}
              </AnimatePresence>
            </Grid>
          ) : (
            <Center mt="2rem" flexDirection="column" gap="1rem">
              <Text maxW="400px" textAlign="center" color="gray.600">
                No listings were found that match your search 🤔 Maybe propose
                the listing to the maintainers?
              </Text>
              <Button as={NextLink} href="/new-listing" variant="rw">
                Propose new listing
              </Button>
            </Center>
          )}
        </chakra.div>
      </Flex>
      <Footer hideBorder />
    </>
  )
}

export default memo(MainList)
