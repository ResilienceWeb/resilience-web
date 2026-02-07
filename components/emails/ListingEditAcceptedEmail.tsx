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
  webTitle: string
  listingTitle: string
  listingSlug: string
  webSlug: string
}

const ListingEditAcceptedEmail = ({
  webTitle,
  listingTitle,
  listingSlug,
  webSlug,
}: Props) => {
  const viewUrl = `https://${webSlug}.resilienceweb.org.uk/${listingSlug}`

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>
        Your edit to {listingTitle} on {webTitle} Resilience Web has been
        accepted
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
            Great news! 🥳 Your suggested edit to{' '}
            <strong>{listingTitle}</strong> on{' '}
            <strong>{webTitle} Resilience Web</strong> has been accepted.
          </Text>
          <Text style={paragraph}>
            Thank you for helping to keep the Resilience Web up to date. Your
            contribution helps make our community resource more valuable for
            everyone.
          </Text>
          <div style={btnContainer}>
            <Link href={viewUrl} style={button}>
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

export default ListingEditAcceptedEmail
