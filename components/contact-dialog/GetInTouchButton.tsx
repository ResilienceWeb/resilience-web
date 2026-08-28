'use client'

import { useState } from 'react'
import { MdOutlineQuestionMark } from 'react-icons/md'
import dynamic from 'next/dynamic'
import { Button } from '@components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@components/ui/tooltip'
import useIsMobile from '@hooks/application/useIsMobile'

const ContactDialog = dynamic(() => import('./ContactDialog'), { ssr: false })

const warmContactDialog = () => {
  void import('./ContactDialog')
}

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
      <Tooltip>
        <TooltipTrigger asChild>
          {isMobile ? (
            <Button
              variant="outline"
              size="icon"
              className="text-xl"
              onPointerEnter={warmContactDialog}
              onFocus={warmContactDialog}
              onClick={() => setIsContactDialogOpen(true)}
            >
              <MdOutlineQuestionMark className="h-5 w-5" />
              <span className="sr-only">Help & feedback</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              onPointerEnter={warmContactDialog}
              onFocus={warmContactDialog}
              onClick={() => setIsContactDialogOpen(true)}
            >
              Help & feedback
            </Button>
          )}
        </TooltipTrigger>
        <TooltipContent>
          <p>
            Questions or feedback about the Resilience Web platform? Contact the
            team here
          </p>
        </TooltipContent>
      </Tooltip>

      {isContactDialogOpen && (
        <ContactDialog
          isOpen
          onClose={() => setIsContactDialogOpen(false)}
          userEmail={userEmail}
          webName={webName}
        />
      )}
    </>
  )
}

export default GetInTouchButton
