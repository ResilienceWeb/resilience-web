import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { isServedTinymceFile } from '../self-hosted-tinymce'

const tinymce = path.join(import.meta.dirname, '../../node_modules/tinymce')
const file = (relative: string) => path.join(tinymce, ...relative.split('/'))

describe('isServedTinymceFile', () => {
  it.each([
    'tinymce.min.js',
    'plugins/help/plugin.min.js',
    'skins/ui/oxide/skin.min.css',
    // The help plugin requests these unminified when it opens.
    'plugins/help/js/i18n/keynav/en.js',
    'plugins/help/js/i18n/keynav/fr_FR.js',
  ])('serves %s', (relative) => {
    expect(isServedTinymceFile(file(relative))).toBe(true)
  })

  it.each(['tinymce.js', 'plugins/help/plugin.js', 'package.json'])(
    'leaves out %s',
    (relative) => {
      expect(isServedTinymceFile(file(relative))).toBe(false)
    },
  )
})
