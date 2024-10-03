import { Tooltip, IconButton, Button, useDisclosure } from '@chakra-ui/react'
import { HiOutlineChatBubbleLeft } from 'react-icons/hi2'

import useIsMobile from '@hooks/application/useIsMobile'
import FeedbackDialog from './FeedbackDialog'

const GetInTouchButton = () => {
  const isMobile = useIsMobile()
  const {
    isOpen: isFeedbackDialogOpen,
    onOpen: onOpenFeedbackDialog,
    onClose: onCloseFeedbackDialog,
  } = useDisclosure()

  const handleOpenFeedbackDialog = () => {
    onOpenFeedbackDialog()
  }

  return (
    <>
      <Tooltip label="Need help? Want to provide feedback? Get in touch here 😊">
        {isMobile ? (
          <IconButton
            aria-label="Send feedback"
            icon={<HiOutlineChatBubbleLeft />}
            onClick={handleOpenFeedbackDialog}
            size="md"
            fontSize="22px"
            variant="outline"
          />
        ) : (
          <Button
            onClick={handleOpenFeedbackDialog}
            size="md"
            variant="outline"
          >
            Get in touch
          </Button>
        )}
      </Tooltip>
      <FeedbackDialog
        isOpen={isFeedbackDialogOpen}
        onClose={onCloseFeedbackDialog}
      />
    </>
  )
}

export default GetInTouchButton
