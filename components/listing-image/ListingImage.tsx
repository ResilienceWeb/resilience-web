import { useRef, memo } from 'react'
import Image from 'next/image'

type Props = {
  alt: string
  src: string
  sizes: string
  priority?: boolean
}

const ListingImage = ({ alt, src, sizes, priority }: Props) => {
  const imageRef = useRef<any>(null)

  return (
    <div
      className="relative h-[170px] w-full overflow-hidden"
      style={{
        backgroundColor: '#ffffff',
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
        unoptimized
      />
    </div>
  )
}

export default memo(ListingImage)
