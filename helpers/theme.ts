import { defineStyleConfig } from '@chakra-ui/react'

const Button = defineStyleConfig({
  defaultProps: {
    colorScheme: 'rw',
  },
  variants: {
    outline: {
      color: 'rw.900',
      borderColor: 'rw.900',
      borderRadius: '10px',
      _hover: {
        bg: 'rw.100',
        color: 'rw.900',
      },
    },
    rw: {
      color: 'white',
      bg: 'rw.700',
      borderRadius: '10px',
      _hover: {
        bg: 'rw.900',
        _disabled: {
          bg: 'rw.900',
        },
      },
    },
    solid: {
      borderRadius: '10px',
    },
  },
})

export const chakraTheme = {
  styles: {
    global: {
      'button:focus': {
        boxShadow: 'none !important',
      },
      'input:focus': {
        boxShadow: 'none !important',
      },
    },
  },
  components: {
    Button,
  },
  colors: {
    rw: {
      100: '#dff7e2',
      200: '#b4fdbd',
      300: '#8fef99',
      400: '#75d77e',
      500: '#64b46c',
      600: '#429466',
      700: '#3A8159',
      800: '#219152',
      900: '#09622f',
    },
  },
  fonts: {
    body: "'Poppins', sans-serif",
    heading: "'Poppins', sans-serif",
  },
}
