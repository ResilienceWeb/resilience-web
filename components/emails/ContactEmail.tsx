import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Text,
} from '@react-email/components'
import {
  main,
  container,
  logo,
  paragraph,
  listItem,
  hr,
  footer,
} from './styles'

type props = {
  email: string
  web?: string
  message: string
}

const ContactEmail = ({ email, web, message }: props) => {
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>New message from {email}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://resilienceweb.org.uk/logo.png"
            width="148"
            height="55"
            alt="Resilience Web logo"
            style={logo}
          />
          <Text style={paragraph}>New message received</Text>
          <Text style={listItem}>
            <strong>From:</strong> {email}
          </Text>
          {web && (
            <Text style={listItem}>
              <strong>Web:</strong> {web}
            </Text>
          )}
          <Hr style={hr} />
          <Text style={paragraph}>{message}</Text>
          <Hr style={hr} />
          <Text style={footer}>Resilience Web CIC</Text>
        </Container>
      </Body>
    </Html>
  )
}

export default ContactEmail
