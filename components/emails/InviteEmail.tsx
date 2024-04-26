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
} from '@react-email/components'
import {
  main,
  container,
  logo,
  paragraph,
  btnContainer,
  button,
  hr,
  footer,
} from './styles'

type props = {
  webTitle: string
  email: string
  url: string
}

const InviteEmail = ({ webTitle, email, url }: props) => {
  // Insert invisible space into domains and email address to prevent both the
  // email address and the domain from being turned into a hyperlink by email
  // clients like Outlook and Apple mail, as this is confusing because it seems
  // like they are supposed to click on their email address to sign in.
  const escapedEmail = `${email.replace(/\./g, '&#8203;.')}`

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
            You are invited to be an editor on{' '}
            <strong>{webTitle} Resilience Web</strong>, a digital mapping of
            organisations that are working to create a more resilient, more
            equitable and greener future for this city and its residents.
          </Text>
          <Text style={paragraph}>
            Click the button below to sign in as{' '}
            <strong dangerouslySetInnerHTML={{ __html: escapedEmail }} />. You
            won't need a password to login, and if you want to access the admin
            dashboard again later you can go to resilienceweb.org.uk/admin.
          </Text>
          <Section style={btnContainer}>
            <Button style={button} href={url}>
              Activate account
            </Button>
          </Section>
          <Text style={paragraph}>
            There is lots of great work being done by the multitude of groups
            working to make a positive difference in the areas of the
            environment and civil society. However, there wasn't a single place
            to go that showed all the organisations and how they are connected.
            These webs, in the first instance, are therefore a tool to help
            potential volunteers to discover organisations such as yours.
            Additionally, we want to facilitate collaboration across
            organisations as much as possible.
          </Text>
          <Text style={paragraph}>
            We hope you are excited to be a part of the Resilience Web, and that
            you will share it with members of your organisation! If you have any
            questions about the web, or if you would rather not be included on
            it, please let us know by replying to this email. If you have any
            feedback, we would also be very happy to hear it.
          </Text>
          <Text style={paragraph}>
            If everything sounds good, click the green button to activate your
            account.
          </Text>
          <Section style={btnContainer}>
            <Button style={button} href={url}>
              Activate account
            </Button>
          </Section>
          <Text style={paragraph}>
            If you're not sure why you received this invite or if you have any
            questions, please reply to this email.
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

export default InviteEmail
