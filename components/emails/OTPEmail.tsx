import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { main, container, logo, paragraph } from './styles'

export type OTPEmailProps = {
  email: string
  otp: string
}

const OTPEmail = ({ email, otp }: OTPEmailProps) => {
  // Insert invisible space into email address to prevent it from being
  // turned into a hyperlink by email clients like Outlook and Apple Mail.
  const escapedEmail = `${email.replace(/\./g, '&#8203;.')}`

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your Resilience Web verification code</Preview>
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
            Hello! You requested a verification code to sign in to Resilience
            Web.
          </Text>

          <Text style={paragraph}>
            Your verification code for{' '}
            <strong dangerouslySetInnerHTML={{ __html: escapedEmail }} /> is:
          </Text>

          <Section style={otpContainer}>
            <Text style={otpCode}>{otp}</Text>
          </Section>

          <Text style={paragraph}>
            <strong>This code will expire in 10 minutes.</strong>
          </Text>

          <Text style={paragraph}>
            If you didn't request this code, please ignore this email. Your
            account remains secure.
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

const otpContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
  padding: '24px',
  backgroundColor: '#f4f4f4',
  borderRadius: '8px',
}

const otpCode = {
  fontSize: '48px',
  fontWeight: 'bold',
  letterSpacing: '8px',
  color: '#09622f',
  margin: '0',
  fontFamily: 'monospace',
}

export default OTPEmail
