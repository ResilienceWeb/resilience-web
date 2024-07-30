import { memo, useCallback, useEffect, useState, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import {
  chakra,
  Flex,
  Grid,
  Center,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'

import { useCategories } from '@hooks/categories'
import { PROTOCOL, REMOTE_HOSTNAME } from '@helpers/config'
import Footer from '@components/footer'
import Dialog from './dialog'
import Item from './item'

const MainList = ({ filteredItems, isMobile }) => {
  const router = useRouter()
  const [selectedDataItem, setSelectedDataItem] = useState<any>()
  const {
    isOpen: isDialogOpen,
    onOpen: onOpenDialog,
    onClose: onCloseDialog,
  } = useDisclosure()

  const [subdomain, setSubdomain] = useState<string>()

  useEffect(() => {
    const hostname = window.location.hostname
    if (!hostname.includes('.')) {
      return
    }

    setSubdomain(hostname.split('.')[0])
  }, [])

  const handleItemClick = useCallback(
    (item) => {
      setSelectedDataItem(item)
      if (isMobile) {
        const individualListingLink = `${PROTOCOL}://${subdomain}.${REMOTE_HOSTNAME}/${item.slug}`
        router.push(individualListingLink)
      } else {
        onOpenDialog()
      }
    },
    [isMobile, onOpenDialog, router, subdomain],
  )

  const handleCloseDialog = useCallback(() => {
    setSelectedDataItem(null)
    onCloseDialog()
  }, [onCloseDialog])

  const { categories } = useCategories()
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
                    handleClick={handleItemClick}
                    key={item.id}
                  />
                ))}
              </AnimatePresence>
            </Grid>
          ) : (
            <Center mt="2rem">
              <Text maxW="400px" textAlign="center" color="gray.600">
                No groups matched your search criteria 🤔 Maybe propose the
                listing to the maintainers via the Propose new listing button?
              </Text>
            </Center>
          )}
        </chakra.div>
      </Flex>
      <Footer hideBorder />
      {selectedDataItem && (
        <Dialog
          isOpen={isDialogOpen}
          isMobile={isMobile}
          item={selectedDataItem}
          onClose={handleCloseDialog}
        />
      )}
    </>
  )
}

export default memo(MainList)
