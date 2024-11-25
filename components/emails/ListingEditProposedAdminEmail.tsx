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
}

const ListingEditProposedAdminEmail = ({ webTitle, listingTitle }: Props) => {
  const editUrl = `https://resilienceweb.org.uk/admin`

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>
        New edit suggestion for {listingTitle} on {webTitle} Resilience Web
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
            Someone has suggested changes to the listing "{listingTitle}" on{' '}
            {webTitle} Resilience Web 📝
          </Text>
          <Text style={paragraph}>
            Please review these changes and either accept or reject them.
          </Text>
          <div style={btnContainer}>
            <Link href={editUrl} style={button}>
              Review Changes
            </Link>
          </div>
          <Hr style={hr} />
          <Text style={footer}>
            Resilience Web - Local discovery, collaboration and networking
            between activists and organisations
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default ListingEditProposedAdminEmail
