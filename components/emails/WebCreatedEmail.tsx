import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Link,
} from '@react-email/components'
import {
  main,
  container,
  logo,
  paragraph,
  listItem,
  btnContainer,
  button,
  hr,
  footer,
} from './styles'

type props = {
  webTitle: string
  url: string
}

const WebCreatedEmail = ({ webTitle, url }: props) => {
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
            alt="Resilience Web logo"
            style={logo}
          />
          <Text style={paragraph}>Hello 👋</Text>
          <Text style={paragraph}>
            Well done for creating Resilience Web {webTitle}! 🥳
          </Text>
          <Text style={paragraph}>You are now able to:</Text>
          <Text style={listItem}>• invite others to join your team</Text>
          <Text style={listItem}>• add, edit and remove listings</Text>
          <Text style={listItem}>• manage categories and tags</Text>
          <Text style={listItem}>• manage your web's settings</Text>
          <Text style={paragraph}>
            If you ever need help, you can always get in touch at{' '}
            <Link href="mailto@resilienceweb.org.uk">
              info@resilienceweb.org.uk
            </Link>
          </Text>
          <Section style={btnContainer}>
            <Button style={button} href={url}>
              Go to admin dashboard
            </Button>
          </Section>
          <Text style={paragraph}>
            Best,
            <br />
            The Resilience Web team
          </Text>
          <Hr style={hr} />
          <Text style={footer}>Resilience Web</Text>
        </Container>
      </Body>
    </Html>
  )
}

export default WebCreatedEmail
