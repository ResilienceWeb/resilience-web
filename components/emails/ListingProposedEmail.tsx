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
  proposedListingTitle: string
  proposerEmail: string
  webTitle: string
  url: string
}

const ListingProposedEmail = ({
  proposedListingTitle,
  proposerEmail,
  webTitle,
  url,
}: props) => {
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
            A helpful visitor proposed a new listing to add to {webTitle}{' '}
            Resilience Web. Head to <Link href={url}>{url}</Link> where you can
            review it.
          </Text>
          <Text style={paragraph}>Here are the details:</Text>
          <Text style={listItem}>Listing title: {proposedListingTitle}</Text>
          <Text style={listItem}>Proposed by: {proposerEmail}</Text>
          <Hr style={hr} />
          <Text style={footer}>Resilience Web CIC</Text>
        </Container>
      </Body>
    </Html>
  )
}

export default ListingProposedEmail
