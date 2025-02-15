import { Prisma } from '@prisma/client'
import { auth } from '@auth'
import prisma from '@prisma-rw'
import WebCreatedEmail from '@components/emails/WebCreatedEmail'
import WebCreatedAdminEmail from '@components/emails/WebCreatedAdminEmail'
import { PROTOCOL, REMOTE_HOSTNAME } from '@helpers/config'
import { stringToBoolean } from '@helpers/utils'
import { sendEmail } from '@helpers/email'

const defaultCategories = [
  {
    label: 'Environment',
    color: '7ed957',
  },
  {
    label: 'Community',
    color: 'ff66c4',
  },
  {
    label: 'Social justice',
    color: 'ff5757',
  },
]

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams
    const withListingsParam = searchParams.get('withListings')
    const withAdminInfoParam = searchParams.get('withAdminInfo')
    const onlyPublishedParam = searchParams.get('published')
    const withListings = withListingsParam
      ? stringToBoolean(withListingsParam)
      : false
    const withAdminInfo = withAdminInfoParam
      ? stringToBoolean(withAdminInfoParam)
      : false
    const onlyPublished = onlyPublishedParam
      ? stringToBoolean(onlyPublishedParam)
      : false

    const include = Prisma.validator<Prisma.WebInclude>()({
      listings: {},
      permissions: {},
      ownerships: {},
    })

    if (withListings) {
      include.listings = {
        select: {
          id: true,
          webId: true,
          updatedAt: true,
        },
      }
    }

    if (withAdminInfo) {
      include.permissions = true
      include.ownerships = true
    }

    const webs = await prisma.web.findMany({
      where: {
        ...(onlyPublished
          ? {
              published: true,
            }
          : {}),
      },
      include,
    })

    return Response.json({ data: webs })
  } catch (e) {
    console.error(`[RW] Unable to fetch webs - ${e}`)
    return new Response(`Unable to fetch webs - ${e}`, {
      status: 500,
    })
  }
}

export async function POST(request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return Response.json(
        {
          error: `You don't have enough permissions to perform this action.`,
        },
        {
          status: 403,
        },
      )
    }

    const { title, slug, description } = await request.json()

    const currentOwnerships = await prisma.ownership.findUnique({
      where: {
        email: session.user.email,
      },
      include: {
        webs: true,
      },
    })

    if (currentOwnerships?.webs.length > 0 && !session.user.admin) {
      return Response.json(
        {
          error:
            'You already own a web and at present we do not allow anyone to create more than one. If you want to delete your current Resilience Web to create a new one please get in touch at info@resilienceweb.org.uk',
        },
        {
          status: 403,
        },
      )
    }

    const web = await prisma.web.create({
      data: {
        title,
        slug,
        description,
        published: false,
        categories: {
          create: defaultCategories,
        },
        ownerships: {
          connectOrCreate: {
            where: {
              email: session.user.email,
            },
            create: {
              email: session.user.email,
            },
          },
        },
      },
    })

    const webCreatedEmailComponent = WebCreatedEmail({
      webTitle: `${web.title}`,
      url: `${PROTOCOL}://${REMOTE_HOSTNAME}/admin`,
    })

    const webCreatedAdminEmailComponent = WebCreatedAdminEmail({
      webTitle: `${web.title}`,
      email: `${session?.user.email}`,
      slug: web.slug,
    })

    await sendEmail({
      to: session?.user.email,
      subject: `Thank you for creating ${web.title} Resilience Web 🎉`,
      email: webCreatedEmailComponent,
    })

    await sendEmail({
      to: REMOTE_HOSTNAME.includes('localhost')
        ? 'ismail.diner+rw@gmail.com'
        : 'info@resilienceweb.org.uk',
      subject: `Someone just created a new resilience web 🎉`,
      email: webCreatedAdminEmailComponent,
    })

    return Response.json({
      web,
    })
  } catch (error) {
    if (error.code === 'P2002') {
      return new Response(
        'Sorry, a web with the same title or link already exists',
        {
          status: 409,
        },
      )
    } else {
      console.error(`[RW] Unable to create web - ${error}`)
      return new Response(`Unable to create web - ${error}`, {
        status: 500,
      })
    }
  }
}
