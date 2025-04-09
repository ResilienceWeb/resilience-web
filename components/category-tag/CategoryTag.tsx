import { Badge } from '@components/ui/badge'
import chroma from 'chroma-js'
import { cn } from '@components/lib/utils'

import { selectMoreAccessibleColor } from '@helpers/colors'

interface CategoryTagProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  colorHex: string
  alpha?: number
}

const CategoryTag = ({
  children,
  colorHex,
  alpha = 1,
  className,
  ...props
}: CategoryTagProps) => {
  const color = chroma(colorHex)

  const accessibleTextColor = selectMoreAccessibleColor(
    colorHex,
    '#3f3f40',
    '#fff',
  )

  return (
    <Badge
      className={cn(
        'w-fit shrink-0 text-xs font-semibold select-none',
        className,
      )}
      style={{
        backgroundColor: color.alpha(alpha).css(),
        color: accessibleTextColor,
      }}
      {...props}
    >
      {children}
    </Badge>
  )
}

export default CategoryTag
