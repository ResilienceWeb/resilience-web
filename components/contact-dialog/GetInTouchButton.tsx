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
import ContactDialog from './ContactDialog'

const GetInTouchButton = ({ userEmail }: { userEmail?: string }) => {
  const isMobile = useIsMobile()
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false)

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
                onClick={() => setIsContactDialogOpen(true)}
              >
                <HiOutlineChatBubbleLeft className="h-5 w-5" />
                <span className="sr-only">Get in touch</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => setIsContactDialogOpen(true)}
              >
                Get in touch
              </Button>
            )}
          </TooltipTrigger>
          <TooltipContent>
            <p>Need help? Want to provide feedback? Get in touch here</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <ContactDialog
        isOpen={isContactDialogOpen}
        onClose={() => setIsContactDialogOpen(false)}
        userEmail={userEmail}
      />
    </>
  )
}

export default GetInTouchButton
