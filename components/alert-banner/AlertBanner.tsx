import { memo } from 'react'
import { Alert, AlertIcon, AlertDescription, Box, Link } from '@chakra-ui/react'

interface IAlertProps {
  type: 'info' | 'warning' | 'success'
  content: string
  url: string
}

const AlertBanner: React.FC<IAlertProps> = ({ type, content, url }) => {
  return (
    <Link href={url} isExternal width="100%">
      <Alert status={type} variant="solid" justifyContent="center">
        <Box display="flex" flex="1" maxW="7xl" paddingInlineStart="1rem">
          <AlertIcon />
          <AlertDescription fontSize="15px">{content}</AlertDescription>
        </Box>
      </Alert>
    </Link>
  )
}

export default memo(AlertBanner)
