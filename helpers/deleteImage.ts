import path from 'path'
import { supabaseAdmin, STORAGE_BUCKET } from '../lib/supabase-storage'

export default async function deleteImage(imageKey: string): Promise<void> {
  const fileName = path.basename(imageKey)

  const { error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .remove([fileName])

  if (error) {
    console.error('[RW] Error deleting image', error)
  }
}
