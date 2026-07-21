'use client'

import { useState } from 'react'
import { MdOutlineQuestionMark } from 'react-icons/md'
import { Button } from '@components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@components/ui/tooltip'
import useIsMobile from '@hooks/application/useIsMobile'
import ContactDialog from './ContactDialog'

const GetInTouchButton = ({
  userEmail,
  webName,
}: {
  userEmail?: string
  webName?: string
}) => {
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
                <MdOutlineQuestionMark className="h-5 w-5" />
                <span className="sr-only">Help & feedback</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => setIsContactDialogOpen(true)}
              >
                Help & feedback
              </Button>
            )}
          </TooltipTrigger>
          <TooltipContent>
            <p>
              Questions or feedback about the Resilience Web platform? Contact
              the team here
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <ContactDialog
        isOpen={isContactDialogOpen}
        onClose={() => setIsContactDialogOpen(false)}
        userEmail={userEmail}
        webName={webName}
      />
    </>
  )
}

export default GetInTouchButton
