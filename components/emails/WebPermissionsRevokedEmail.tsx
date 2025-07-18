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
import { main, container, logo, paragraph, hr, footer } from './styles'

type props = {
  webTitle: string
  webOwnerEmail: string
}

const WebPermissionsRevokedEmail = ({ webTitle, webOwnerEmail }: props) => {
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>
        You have been removed from the {webTitle} Resilience Web team
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://resilienceweb.org.uk/logo.png"
            width="148"
            height="55"
            alt="Resilience Web logo"
            style={logo}
          />
          <Text style={paragraph}>Hello 👋</Text>
          <Text style={paragraph}>
            {webOwnerEmail} has removed you from the {webTitle} Resilience Web
            team. If you did not expect this or you think it may have been done
            by mistake, please get in touch with them.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>Resilience Web CIC</Text>
        </Container>
      </Body>
    </Html>
  )
}

export default WebPermissionsRevokedEmail
