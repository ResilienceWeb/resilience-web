import chroma from 'chroma-js'
import { selectMoreAccessibleColor } from '@helpers/colors'
import { icons } from '@helpers/icons'
import { cn } from '@components/lib/utils'
import { Badge } from '@components/ui/badge'

interface CategoryTagProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  colorHex: string
  alpha?: number
  iconName?: string
}

const CategoryTag = ({
  children,
  colorHex,
  alpha = 1,
  iconName,
  className,
  ...props
}: CategoryTagProps) => {
  const color = chroma(colorHex)

  const accessibleTextColor = selectMoreAccessibleColor(
    colorHex,
    '#3f3f40',
    '#fff',
  )

  const IconComponent =
    iconName && iconName !== 'default'
      ? icons.find((i) => i.name === iconName)?.icon
      : undefined

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
      {IconComponent && <IconComponent className="mr-1" aria-hidden="true" />}
      {children}
    </Badge>
  )
}

export default CategoryTag
