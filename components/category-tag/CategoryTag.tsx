import { selectMoreAccessibleColor, withAlpha } from '@helpers/colors'
import { getIcon } from '@helpers/icons'
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
  const accessibleTextColor = selectMoreAccessibleColor(
    colorHex,
    '#3f3f40',
    '#fff',
  )

  const IconComponent =
    iconName && iconName !== 'default' ? getIcon(iconName)?.icon : undefined

  return (
    <Badge
      className={cn(
        'w-fit shrink-0 text-xs font-semibold select-none',
        className,
      )}
      style={{
        backgroundColor: withAlpha(colorHex, alpha),
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
