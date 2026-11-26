import { Body, Container, Head, Html, Img, Preview, Text } from 'react-email'
import { main, container, logo, paragraph } from './styles'

type EmailChangedEmailProps = {
  newEmail: string
}

const EmailChangedEmail = ({ newEmail }: EmailChangedEmailProps) => {
  // Insert invisible space into email address to prevent it from being
  // turned into a hyperlink by email clients like Outlook and Apple Mail.
  const escapedEmail = `${newEmail.replace(/\./g, '&#8203;.')}`

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>
        The email address on your Resilience Web account changed
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

          <Text style={paragraph}>
            Hello! The email address on your Resilience Web account has been
            changed to{' '}
            <strong dangerouslySetInnerHTML={{ __html: escapedEmail }} />. From
            now on, use that address to sign in.
          </Text>

          <Text style={paragraph}>
            If you made this change, there is nothing else to do.
          </Text>

          <Text style={paragraph}>
            <strong>If you didn&apos;t make this change</strong>, please reply
            to this email or contact us at info@resilienceweb.org.uk straight
            away so we can secure your account.
          </Text>

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

export default EmailChangedEmail
