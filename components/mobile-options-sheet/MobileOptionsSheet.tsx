import { HiOutlineAdjustmentsHorizontal } from 'react-icons/hi2'
import Link from 'next/link'
import { REMOTE_URL } from '@helpers/config'
import DonateButton from '@components/donate-button'
import RichText from '@components/rich-text'
import { Button } from '@components/ui/button'
import { Separator } from '@components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@components/ui/sheet'

const MobileOptionsSheet = ({
  webDescription,
  isTransitionMode,
  selectedWebSlug,
}: {
  webDescription?: string
  isTransitionMode: boolean
  selectedWebSlug: string
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
                <Link href={`${REMOTE_URL}/new-listing/${selectedWebSlug}`}>
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
                {webDescription && webDescription.length < 100 && (
                  <>
                    <h2 className="mb-2 text-lg font-semibold">
                      About this web
                    </h2>
                    <RichText html={webDescription} />
                  </>
                )}

                {webDescription && webDescription.length >= 100 && (
                  <Link href="/web">
                    <Button variant="outline">About this web</Button>
                  </Link>
                )}
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
