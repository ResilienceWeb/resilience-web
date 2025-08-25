import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import {
  main,
  container,
  logo,
  paragraph,
  btnContainer,
  button,
} from './styles'

export type SimpleTemplateEmailProps = {
  url: string
  email: string
  buttonText: string
  mainText: string
  footerText: string
}

const SignInEmail = ({
  url,
  email,
  buttonText,
  mainText,
  footerText,
}: SimpleTemplateEmailProps) => {
  // Insert invisible space into domains and email address to prevent both the
  // email address and the domain from being turned into a hyperlink by email
  // clients like Outlook and Apple Mail.
  const escapedEmail = `${email.replace(/\./g, '&#8203;.')}`

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Resilience Web</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://resilienceweb.org.uk/logo.png"
            width="148"
            height="55"
            alt="Resilience Web CIC logo"
            style={logo}
          />

          <Text style={paragraph}>{mainText}</Text>

          <Text style={paragraph}>
            Click the button below to sign in as{' '}
            <strong dangerouslySetInnerHTML={{ __html: escapedEmail }} />
          </Text>

          <Section style={btnContainer}>
            <Button style={button} href={url}>
              {buttonText}
            </Button>
          </Section>

          <Text style={paragraph}>{footerText}</Text>

          <Text style={paragraph}>
            Best,
            <br />
            The Resilience Web CIC team
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default SignInEmail
