import { Tooltip, IconButton, Button, useDisclosure } from '@chakra-ui/react'
import { ChatIcon } from '@chakra-ui/icons'
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
            icon={<ChatIcon />}
            onClick={handleOpenFeedbackDialog}
            size="md"
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
