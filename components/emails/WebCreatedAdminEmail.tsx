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
  webTitle: string
  email: string
  slug: string
}

const WebCreatedAdminEmail = ({ webTitle, email, slug }: props) => {
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
            There was a new web just created: {webTitle} Resilience Web 🥳
          </Text>
          <Text style={paragraph}>Here are the details:</Text>
          <Text style={listItem}>User email: {email}</Text>
          <Text style={listItem}>
            Link:{' '}
            <Link
              href={`https://${slug}.resilienceweb.org.uk`}
            >{`https://${slug}.resilienceweb.org.uk`}</Link>
          </Text>
          <Hr style={hr} />
          <Text style={footer}>Resilience Web CIC</Text>
        </Container>
      </Body>
    </Html>
  )
}

export default WebCreatedAdminEmail
