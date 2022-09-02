import { InputGroup, Input, InputRightElement } from '@chakra-ui/react'

const SignupForm = () => {
  return (
    <form
      action="https://www.getrevue.co/profile/resilienceweb/add_subscriber"
      method="post"
      name="revue-form"
      target="_blank"
    >
      <InputGroup size="md">
        <Input
          pr="8.5rem"
          type="email"
          name="member[email]"
          placeholder="Your email address"
          background="white"
          textColor="gray.900"
          _placeholder={{ color: 'gray.700' }}
        />
        <InputRightElement width="8.5rem">
          <Input
            type="submit"
            value="Subscribe"
            name="member[subscribe]"
            h="100%"
            size="md"
            bg="rw.700"
            colorScheme="rw.700"
            color="white"
            borderLeftRadius="none"
            borderRightRadius="md"
            border="none"
            cursor="pointer"
            fontWeight={600}
            _hover={{ bg: 'rw.900' }}
          />
        </InputRightElement>
      </InputGroup>
    </form>
  )
}

export default SignupForm
