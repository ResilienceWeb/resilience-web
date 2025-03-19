import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@components/ui/sheet'
import { Button } from '@components/ui/button'
import { HiOutlineAdjustmentsHorizontal } from 'react-icons/hi2'
import Link from 'next/link'
import { Separator } from '@components/ui/separator'
import DonateButton from '@components/donate-button'

const MobileOptionsSheet = ({
  webDescription,
  isTransitionMode,
}: {
  webDescription?: string
  isTransitionMode: boolean
}) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="default"
          className="fixed right-4 bottom-4 z-50 h-10 transition-all active:scale-95"
        >
          <HiOutlineAdjustmentsHorizontal />
          <span className="font-semibold">Options</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-center">Options</SheetTitle>
        </SheetHeader>
        <div className="mt-6 flex flex-col gap-4">
          {!isTransitionMode && (
            <>
              <div className="px-1">
                <Link href="/new-listing">
                  <Button
                    size="lg"
                    variant="default"
                    className="w-full bg-[#2B8257] hover:bg-[#236c47]"
                  >
                    Propose new listing
                  </Button>
                </Link>
                <p className="mt-1 text-sm text-gray-600">
                  Know something that isn't yet listed? Let us know! 🙏
                </p>
              </div>
            </>
          )}

          {webDescription && (
            <>
              <Separator />
              <div className="px-1">
                <h2 className="mb-2 text-lg font-semibold">About this web</h2>
                <p className="text-sm text-gray-600">{webDescription}</p>
              </div>
            </>
          )}

          <Separator />
          <div className="px-1">
            <h2 className="mb-2 text-lg font-semibold">Like what you see?</h2>
            <p className="mb-4 text-sm text-gray-600">
              {isTransitionMode
                ? 'If you can, please support the technology behind this with a small donation.'
                : 'Consider making a donation to help us host and develop the Resilience Web platform 🙏🏼'}
            </p>
            <DonateButton />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default MobileOptionsSheet
