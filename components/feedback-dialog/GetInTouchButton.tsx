'use client'

import { useState } from 'react'
import { HiOutlineChatBubbleLeft } from 'react-icons/hi2'
import { Button } from '@components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@components/ui/tooltip'

import useIsMobile from '@hooks/application/useIsMobile'
import FeedbackDialog from './FeedbackDialog'

const GetInTouchButton = () => {
  const isMobile = useIsMobile()
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false)

  const handleOpenFeedbackDialog = () => {
    setIsFeedbackDialogOpen(true)
  }

  const handleCloseFeedbackDialog = () => {
    setIsFeedbackDialogOpen(false)
  }

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {isMobile ? (
              <Button
                variant="outline"
                size="icon"
                className="text-xl"
                onClick={handleOpenFeedbackDialog}
              >
                <HiOutlineChatBubbleLeft className="h-5 w-5" />
                <span className="sr-only">Send feedback</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleOpenFeedbackDialog}
              >
                Get in touch
              </Button>
            )}
          </TooltipTrigger>
          <TooltipContent>
            <p>Need help? Want to provide feedback? Get in touch here 😊</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <FeedbackDialog
        isOpen={isFeedbackDialogOpen}
        onClose={handleCloseFeedbackDialog}
      />
    </>
  )
}

export default GetInTouchButton
