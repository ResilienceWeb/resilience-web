// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./next-auth.d.ts" />

type Listing = {
  id: number
  title: string
  categoryId?: number
  webId?: number
  website?: string
  description: string
  email?: string
  facebook?: string
  instagram?: string
  twitter?: string
  notes?: string
  seekingVolunteers: boolean
  inactive: boolean
  slug: string
  image?: string
  tags?: Tag[]
  relations?: Listing[]
  relationOf?: Listing[]
}
