import { Tag, Text } from '@chakra-ui/react'
import chroma from 'chroma-js'

import { selectMoreAccessibleColor } from '@helpers/colors'

const CategoryTag = ({ children, colorHex, alpha = 1, ...props }) => {
  const color = chroma(colorHex)

  const accessibleTextColor = selectMoreAccessibleColor(
    colorHex,
    '#3f3f40',
    '#fff',
  )

  return (
    <Tag
      backgroundColor={color.alpha(alpha).css()}
      userSelect="none"
      flexShrink="0"
      {...props}
    >
      <Text color={accessibleTextColor} fontWeight="600" fontSize="0.75rem">
        {children}
      </Text>
    </Tag>
  )
}

export default CategoryTag
