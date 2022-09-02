const backgroundColor = '#f9f9f9'
const textColor = '#444444'
const mainBackgroundColor = '#ffffff'
const buttonBackgroundColor = '#3A8159'
const buttonBorderColor = '#3A8159'
const buttonTextColor = '#ffffff'

export const simpleHtmlTemplate = ({
  url,
  email,
  buttonText,
  mainText,
  footerText,
}: {
  url: string
  email: string
  buttonText: string
  mainText: string
  footerText: string
}) => {
  // Insert invisible space into domains and email address to prevent both the
  // email address and the domain from being turned into a hyperlink by email
  // clients like Outlook and Apple mail, as this is confusing because it seems
  // like they are supposed to click on their email address to sign in.
  const escapedEmail = `${email.replace(/\./g, '&#8203;.')}`

  // Uses tables for layout and inline CSS due to email client limitations
  return `
  <body style="background: ${backgroundColor}; padding-bottom: 16px;">
	<table width="100%" border="0" cellspacing="0" cellpadding="0">
	  <tr>
		<td align="center" style="padding: 10px 0px 20px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
		  <strong>Cambridge Resilience Web</strong>
		</td>
	  </tr>
	</table>
	<table width="100%" border="0" cellspacing="20" cellpadding="0" style="background: ${mainBackgroundColor}; max-width: 600px; margin: auto; border-radius: 10px;">
	<tr align="center" style="padding: 10px 0px 0px 0px; font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
		${mainText}
	</tr>
	  <tr>
		<td align="center" style="padding: 10px 0px 0px 0px; font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
		  Click the button below to sign in as <strong>${escapedEmail}</strong>
		</td>
	  </tr>
	  <tr>
		<td align="center" style="padding: 20px 0;">
		  <table border="0" cellspacing="0" cellpadding="0">
			<tr>
			  <td align="center" style="border-radius: 5px;" bgcolor="${buttonBackgroundColor}"><a href="${url}" target="_blank" style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${buttonTextColor}; text-decoration: none; text-decoration: none;border-radius: 5px; padding: 10px 20px; border: 1px solid ${buttonBorderColor}; display: inline-block; font-weight: bold;">${buttonText}</a></td>
			</tr>
		  </table>
		</td>
	  </tr>
	  <tr>
		<td align="center" style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
		  ${footerText}
		</td>
	  </tr>
	</table>
  </body>
  `
}

export const htmlTemplate = ({
  url,
  email,
  buttonText,
  mainText,
  secondaryText,
  footerText,
}: {
  url: string
  email: string
  buttonText: string
  mainText: string
  secondaryText: string
  footerText: string
}) => {
  // Insert invisible space into domains and email address to prevent both the
  // email address and the domain from being turned into a hyperlink by email
  // clients like Outlook and Apple mail, as this is confusing because it seems
  // like they are supposed to click on their email address to sign in.
  const escapedEmail = `${email.replace(/\./g, '&#8203;.')}`

  // Uses tables for layout and inline CSS due to email client limitations
  return `
  <body style="background: ${backgroundColor}; padding-bottom: 16px;">
	<table width="100%" border="0" cellspacing="0" cellpadding="0">
	  <tr>
		<td align="center" style="padding: 10px 0px 20px 0px; font-size: 24px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
		  <strong>Cambridge Resilience Web</strong>
		</td>
	  </tr>
	</table>
	<table width="100%" border="0" cellspacing="20" cellpadding="0" style="background: ${mainBackgroundColor}; max-width: 600px; margin: auto; border-radius: 10px;">
	<tr style="padding: 10px 0px 0px 0px; font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
		${mainText}
	</tr>
	  <tr>
		<td style="padding: 10px 0px 0px 0px; font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
		  Click the button below to sign in as <strong>${escapedEmail}</strong>. You won't need a password to login, and if you want to access the admin dashboard again later you can go to cambridgeresilienceweb.org.uk/admin.
		</td>
	  </tr>
	  <tr>
		<td align="center" style="padding: 16px 0 8 0;">
		  <table border="0" cellspacing="0" cellpadding="0">
			<tr>
			  <td align="center" style="border-radius: 5px;" bgcolor="${buttonBackgroundColor}"><a href="${url}" target="_blank" style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${buttonTextColor}; text-decoration: none; text-decoration: none;border-radius: 5px; padding: 10px 16px; border: 1px solid ${buttonBorderColor}; display: inline-block; font-weight: bold;">${buttonText}</a></td>
			</tr>
		  </table>
		</td>
	  </tr>
	  <tr style="padding: 2px 0px 0px 0px; font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
		${secondaryText}
	  </tr>
	  <tr>
		<td align="center" style="padding: 16px 0 8 0;">
		  <table border="0" cellspacing="0" cellpadding="0">
			<tr>
			  <td align="center" style="border-radius: 5px;" bgcolor="${buttonBackgroundColor}"><a href="${url}" target="_blank" style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${buttonTextColor}; text-decoration: none; text-decoration: none;border-radius: 5px; padding: 10px 16px; border: 1px solid ${buttonBorderColor}; display: inline-block; font-weight: bold;">${buttonText}</a></td>
			</tr>
		  </table>
		</td>
	  </tr>
	  <tr>
		<td style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
		  ${footerText}
		</td>
	  </tr>
	</table>
  </body>
  `
}

// Email text body – fallback for email clients that don't render HTML
export const textTemplate = ({ url }: { url: string }) =>
  `Sign in to Cambridge Resilience Web\n${url}\n\n`
