import { memo, useCallback, useState, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { chakra, Flex, Grid, useDisclosure } from '@chakra-ui/react'

import { useCategories } from '@hooks/categories'
import Footer from '@components/footer'
import Dialog from './dialog'
import Item from './item'

const MainList = ({ filteredItems, isMobile }) => {
  const [selectedDataItem, setSelectedDataItem] = useState()
  const {
    isOpen: isDialogOpen,
    onOpen: onOpenDialog,
    onClose: onCloseDialog,
  } = useDisclosure()

  const handleOpenDialog = useCallback(
    (item) => {
      setSelectedDataItem(item)
      onOpenDialog()
    },
    [onOpenDialog],
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
        px="2rem"
      >
        <chakra.div marginTop={4} width="100%" maxW="1400px">
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
                  onOpenDialog={handleOpenDialog}
                  key={item.id}
                />
              ))}
            </AnimatePresence>
          </Grid>
        </chakra.div>
      </Flex>
      <Footer />
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
