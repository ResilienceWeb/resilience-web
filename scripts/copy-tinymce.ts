/**
 * Copies the self-hosted TinyMCE build from node_modules into public/tinymce,
 * where the rich text editor loads it from. Tiny Cloud's free plan caps editor
 * loads per month; the GPL build served from our own origin has no cap.
 *
 * Runs before `dev` and `build`, not on install, so a deploy that restores a
 * cached node_modules without reinstalling still ships the editor.
 *
 * Usage: node scripts/copy-tinymce.ts
 */
import { cpSync, rmSync } from 'node:fs'
import path from 'node:path'

const source = path.join(import.meta.dirname, '../node_modules/tinymce')
const destination = path.join(import.meta.dirname, '../public/tinymce')

// The editor loads tinymce.min.js, which asks for .min.js plugins and themes,
// so the unminified sources and package metadata are never requested.
const isNeeded = (file: string) => {
  const name = path.basename(file)
  if (name.endsWith('.js')) return name.endsWith('.min.js')
  return ![
    'package.json',
    'bower.json',
    'composer.json',
    'tinymce.d.ts',
    'README.md',
    'CHANGELOG.md',
  ].includes(name)
}

rmSync(destination, { recursive: true, force: true })
cpSync(source, destination, { recursive: true, filter: isNeeded })
