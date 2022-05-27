import { Tag } from '@chakra-ui/react'
import chroma from 'chroma-js'

const CategoryTag = ({ children, colorHex, ...props }) => {
    const color = chroma(colorHex)

    return (
        <Tag
            backgroundColor={color.alpha(0.5).css()}
            userSelect="none"
            {...props}
        >
            {children}
        </Tag>
    )
}

export default CategoryTag

