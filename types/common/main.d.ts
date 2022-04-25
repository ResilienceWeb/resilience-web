// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./next-auth.d.ts" />

type Listing = {
    title: string
    categoryId?: number
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
}
