import { memo } from 'react'
import { Alert, AlertIcon, AlertDescription, Box, Link } from '@chakra-ui/react'

interface IAlertProps {
  type: 'info' | 'warning' | 'success' | 'loading' | 'error'
  content: string
  url?: string
  colorScheme?: string
}

const AlertBanner: React.FC<IAlertProps> = ({
  type,
  content,
  url,
  colorScheme,
}) => {
  if (url) {
    return (
      <Link href={url} isExternal width="100%">
        <Alert
          status={type}
          variant="solid"
          justifyContent="center"
          colorScheme={colorScheme}
        >
          <Box display="flex" flex="1" maxW="7xl" paddingInlineStart="1rem">
            <AlertIcon />
            <AlertDescription fontSize="15px">{content}</AlertDescription>
          </Box>
        </Alert>
      </Link>
    )
  }

  return (
    <Alert
      status={type}
      variant="solid"
      justifyContent="center"
      colorScheme={colorScheme}
    >
      <Box display="flex" flex="1" maxW="7xl" paddingInlineStart="1rem">
        <AlertIcon />
        <AlertDescription fontSize="15px">{content}</AlertDescription>
      </Box>
    </Alert>
  )
}

export default memo(AlertBanner)
