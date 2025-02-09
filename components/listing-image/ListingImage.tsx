import Image from 'next/image'
import { useLayoutEffect, useRef, useState, memo } from 'react'
import { useExtractColors } from 'react-extract-colors'
import { hasAlpha } from '@helpers/colors'

type Props = {
  alt: string
  src: string
  sizes: string
  isInView?: boolean
  priority?: boolean
}

const ListingImage = ({ alt, src, sizes, isInView, priority }: Props) => {
  const imageRef = useRef<any>(null)
  const [isImageTransparent, setIsImageTransparent] = useState<boolean>(false)
  const { dominantColor } = useExtractColors(src)

  useLayoutEffect(() => {
    if (imageRef.current && (isInView === true || isInView === undefined)) {
      const isTransparent = hasAlpha(imageRef.current)

      setIsImageTransparent(isTransparent)
    }
  }, [isInView])

  return (
    <div
      className="relative h-[170px] w-full overflow-hidden"
      style={{
        backgroundColor: isImageTransparent ? '#ffffff' : dominantColor,
        borderTopLeftRadius: '0.375rem',
        borderTopRightRadius: '0.375rem',
      }}
    >
      <Image
        ref={imageRef}
        alt={alt}
        src={src}
        fill
        priority={priority ?? true}
        sizes={sizes}
        style={{
          borderTopLeftRadius: '0.375rem',
          borderTopRightRadius: '0.375rem',
          objectFit: 'contain',
        }}
      />
    </div>
  )
}

export default memo(ListingImage)
