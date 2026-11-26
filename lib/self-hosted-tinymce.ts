import path from 'node:path'

// The editor loads tinymce.min.js, which asks for .min.js plugins and themes,
// so the unminified sources and package metadata are never requested. The
// exception is the help plugin, which loads js/i18n/keynav/<lang>.js unminified.
export const isServedTinymceFile = (file: string) => {
  const name = path.basename(file)
  if (file.includes(`${path.sep}i18n${path.sep}keynav${path.sep}`)) return true
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
