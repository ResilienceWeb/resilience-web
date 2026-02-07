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
  hr,
  footer,
  button,
  btnContainer,
} from './styles'

type Props = {
  listingTitle: string
  webTitle: string
  listingUrl: string
}

const ListingCreatedEmail = ({ listingTitle, webTitle, listingUrl }: Props) => {
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>
        A listing for {listingTitle} has been created on {webTitle} Resilience
        Web
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://resilienceweb.org.uk/logo.png"
            width="148"
            height="55"
            alt="Resilience Web"
            style={logo}
          />
          <Text style={paragraph}>Hello 👋</Text>
          <Text style={paragraph}>
            A listing for <strong>{listingTitle}</strong> has been created on{' '}
            <strong>{webTitle} Resilience Web</strong>. You received this email
            because this is the contact email address for the listing.
          </Text>
          <Text style={paragraph}>
            If any of the information is incorrect or incomplete, you can
            propose edits by clicking below and pressing the Edit listing
            button.
          </Text>
          <div style={btnContainer}>
            <Link href={listingUrl} style={button}>
              View Listing
            </Link>
          </div>
          <Hr style={hr} />
          <Text style={footer}>
            Resilience Web CIC - Local discovery and collaboration between
            activists and organisations
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default ListingCreatedEmail
