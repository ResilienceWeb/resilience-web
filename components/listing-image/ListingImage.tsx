import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import chroma from 'chroma-js'
import { useResizeObserver } from 'usehooks-ts'
import { getBackgroundColor } from '@helpers/colors'

type Props = {
  alt: string
  src: string
  sizes: string
  isInView?: boolean
  priority?: boolean
}

const ListingImage = ({ alt, src, sizes, isInView, priority }: Props) => {
  const imageRef = useRef<any>()
  const [backgroundPosition, setBackgroundPosition] = useState<
    'cover' | 'contain'
  >('cover')
  const { width } = useResizeObserver({ ref: imageRef })

  useEffect(() => {
    if (
      imageRef.current &&
      width &&
      width > 0 &&
      (isInView === true || isInView === undefined)
    ) {
      const imageBackgroundColor = getBackgroundColor(
        imageRef.current,
        document,
      )
      if (imageBackgroundColor === null) {
        return
      }

      const red = chroma(imageBackgroundColor).get('rgb.r')
      const green = chroma(imageBackgroundColor).get('rgb.g')
      const blue = chroma(imageBackgroundColor).get('rgb.b')
      if (red > 240 && green > 240 && blue > 240) {
        setBackgroundPosition('contain')
      }
    }
  }, [isInView, width])

  return (
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
        objectFit: backgroundPosition,
      }}
    />
  )
}

export default ListingImage
