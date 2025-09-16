import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Text,
  Link,
} from '@react-email/components'
import { main, container, logo, paragraph, hr, footer } from './styles'

type props = {
  webTitle: string
}

const WebInactiveEmail = ({ webTitle }: props) => {
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>
        Local discovery, collaboration and networking between activists and
        organisations
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://resilienceweb.org.uk/logo.png"
            width="148"
            height="55"
            alt="Resilience Web CIC logo"
            style={logo}
          />
          <Text style={paragraph}>Hello 👋</Text>
          <Text style={paragraph}>
            Well done for creating {webTitle} Resilience Web! 🥳
          </Text>
          <Text style={paragraph}>
            We noticed that you haven't created many listings yet. Have you
            encountered any issues?
          </Text>
          <Text style={paragraph}>
            If you need help, you can always get in touch at{' '}
            <Link href="mailto:info@resilienceweb.org.uk">
              info@resilienceweb.org.uk
            </Link>
            . Also, if you changed your mind and you don't want to build this
            web anymore please let us know.
          </Text>
          <Text style={paragraph}>
            Best,
            <br />
            The Resilience Web CIC team
          </Text>
          <Hr style={hr} />
          <Text style={footer}>Resilience Web CIC</Text>
        </Container>
      </Body>
    </Html>
  )
}

export default WebInactiveEmail
