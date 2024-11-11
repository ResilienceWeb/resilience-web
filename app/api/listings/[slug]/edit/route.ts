import { Prisma } from '@prisma/client'
import { auth } from '@auth'

export async function POST(request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new Response('Not authorized', { status: 401 })
    }

    const formData = await request.formData()
    const tags = formData.get('tags')
    const relations = formData.get('relations')
    const pending = formData.get('pending')
    const webId = parseInt(formData.get('webId'))
    const category = parseInt(formData.get('category'))
    const title = formData.get('title')
    const website = formData.get('website')
    const description = formData.get('description')
    const facebook = formData.get('facebook')
    const instagram = formData.get('instagram')
    const twitter = formData.get('twitter')
    const email = formData.get('email')
    const seekingVolunteers = formData.get('seekingVolunteers')
    // const featured = formData.get('featured')
    // const latitude = formData.get('latitude')
    // const longitude = formData.get('longitude')
    // const locationDescription = formData.get('locationDescription')
    const slug = formData.get('slug')
  } catch (e) {
    console.error(`[RW] Unable to create listing edit - ${e}`)
    return new Response(`Unable to create listing edit - ${e}`, {
      status: 500,
    })
  }
}
