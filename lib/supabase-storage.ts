import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY

export const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey)

export const STORAGE_BUCKET = 'resilienceweb-images'

export function getPublicUrl(fileName: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${fileName}`
}
