/**
 * Downloads the Green Map icon set (https://greenmap.org/explore/icons) into
 * public/icons/green-map/ and writes the registry entries to
 * helpers/green-map-icons.ts, and their descriptions to
 * helpers/green-map-icon-descriptions.ts. Used with permission from Green Map System, on
 * condition that they are credited wherever the icons appear.
 *
 * Run once and commit the output; it is not part of the build.
 *
 * Usage: node scripts/download-green-map-icons.ts
 */
import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { optimize } from 'svgo'

const API = 'https://greenmap.org/api-v1/icons'
const ICON_SET_ID = '5ca7b702ecd8490100cab96f'
const ICONS_DIR = path.resolve('public/icons/green-map')
// Tags draw icons in a single colour, using each icon's shape as a mask. Most
// icons are one colour on a transparent background, so their shape is the file
// itself. The few that use white for detail or as a backing get a version here
// with the white cut out, or it would mask as solid.
const MONO_DIR = path.join(ICONS_DIR, 'mono')
const REGISTRY_FILE = path.resolve('helpers/green-map-icons.ts')
// Kept apart from the registry so the ~40 KB of text only reaches the admin
// icon picker, not every page that draws an icon.
const DESCRIPTIONS_FILE = path.resolve('helpers/green-map-icon-descriptions.ts')

type GreenMapIcon = {
  _id: string
  name: string
  subcategory: string
  // A few are stored as Editor.js documents rather than plain text
  description:
    string | { blocks: { type: string; data: { text?: string } }[] } | null
}

const plainText = (description: GreenMapIcon['description']) => {
  const text =
    typeof description === 'string'
      ? description
      : (description?.blocks ?? [])
          .filter((block) => block.type === 'paragraph')
          .map((block) => block.data.text ?? '')
          .join(' ')
  return text.replace(/\s+/g, ' ').trim()
}

const WHITE = /fill:\s*(#fff\b|#ffffff\b|white\b)/i

/**
 * Turns an icon that uses white into a single-colour shape: each white path
 * cuts a hole in whatever was painted before it, and anything painted after it
 * is drawn over the hole as usual. Only handles the flat run of <path>s the
 * set's icons are made of, and fails loudly on anything else.
 */
function cutOutWhite(svg: string) {
  const match = svg.match(/^(<svg[^>]*>)((?:<path[^>]*\/>)+)<\/svg>$/)
  if (!match) {
    throw new Error('Expected an <svg> holding only <path>s')
  }
  const [, open, body] = match
  let painted = ''
  let masks = ''
  for (const [index, element] of (
    body.match(/<path[^>]*\/>/g) ?? []
  ).entries()) {
    if (WHITE.test(element)) {
      const hole = element.replace(/style="[^"]*"/, 'fill="#000"')
      masks += `<mask id="cut${index}" maskUnits="userSpaceOnUse" x="-9999" y="-9999" width="19999" height="19999"><rect x="-9999" y="-9999" width="19999" height="19999" fill="#fff"/>${hole}</mask>`
      painted = `<g mask="url(#cut${index})">${painted}</g>`
    } else {
      painted += element.replace(/style="[^"]*"/, 'fill="#000"')
    }
  }
  return `${open}<defs>${masks}</defs>${painted}</svg>`
}

/** Near-white pixels become transparent, everything else opaque black. */
async function cutOutWhitePng(png: Buffer) {
  const { data, info } = await sharp(png)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const rgba = Buffer.alloc(info.width * info.height * 4)
  for (let pixel = 0; pixel < info.width * info.height; pixel++) {
    const [r, g, b] = [0, 1, 2].map((c) => data[pixel * 3 + c])
    rgba[pixel * 4 + 3] = 255 - Math.min(r, g, b)
  }
  return sharp(rgba, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toBuffer()
}

const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

async function fetchOk(url: string) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`${url} responded ${response.status}`)
  }
  return response
}

async function main() {
  const { icons } = (await (
    await fetchOk(`${API}?iconSet=${ICON_SET_ID}`)
  ).json()) as { icons: GreenMapIcon[] }

  const entries = icons.map((icon) => ({
    id: icon._id,
    slug: slugify(icon.name),
    name: icon.name.trim(),
    category: icon.subcategory.trim(),
    description: plainText(icon.description),
  }))

  const slugs = new Set(entries.map((entry) => entry.slug))
  if (slugs.size !== entries.length) {
    throw new Error('Two Green Map icons share a slug')
  }

  await rm(ICONS_DIR, { recursive: true, force: true })
  await mkdir(MONO_DIR, { recursive: true })

  let originalBytes = 0
  let optimisedBytes = 0
  const files = new Map<string, string>()
  const monoFiles = new Map<string, string>()
  for (const entry of entries) {
    const response = await fetchOk(`${API}/${entry.id}/image/value`)
    const original = Buffer.from(await response.arrayBuffer())

    // A few icons in the set are served as PNG rather than SVG.
    let file: string
    let data: string | Buffer
    let mono: string | Buffer | undefined
    if (response.headers.get('content-type')?.includes('svg')) {
      file = `${entry.slug}.svg`
      // preset-default strips the Illustrator/Inkscape metadata but keeps the
      // viewBox, dimensions and colours. The dimensions matter: Firefox won't
      // draw an SVG without an intrinsic size onto the network canvas.
      data = optimize(original.toString('utf8'), { multipass: true }).data
      if (WHITE.test(data)) mono = cutOutWhite(data)
    } else {
      // The PNGs have no transparency: white is their background
      file = `${entry.slug}.png`
      data = await sharp(original).png({ compressionLevel: 9 }).toBuffer()
      mono = await cutOutWhitePng(original)
    }

    if (mono) {
      await writeFile(path.join(MONO_DIR, file), mono)
      monoFiles.set(entry.slug, `mono/${file}`)
    }

    await writeFile(path.join(ICONS_DIR, file), data)
    files.set(entry.slug, file)
    originalBytes += original.length
    optimisedBytes += data.length
  }

  const registry = entries
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(({ slug, name, category }) => ({
      slug,
      name,
      category,
      file: files.get(slug),
      ...(monoFiles.has(slug) ? { monoFile: monoFiles.get(slug) } : {}),
    }))

  await writeFile(
    REGISTRY_FILE,
    `// Generated by scripts/download-green-map-icons.ts. Do not edit by hand.
// Icons © Green Map System, used with permission. See https://greenmap.org

export type GreenMapIcon = {
  slug: string
  name: string
  category: string
  file: string
  /** A single-colour version, for icons that use white. Others are one already. */
  monoFile?: string
}

export const greenMapIcons: GreenMapIcon[] = ${JSON.stringify(registry, null, 2)}
`,
  )

  const descriptions = Object.fromEntries(
    registry.map(({ slug }) => [
      slug,
      entries.find((entry) => entry.slug === slug)?.description ?? '',
    ]),
  )
  await writeFile(
    DESCRIPTIONS_FILE,
    `// Generated by scripts/download-green-map-icons.ts. Do not edit by hand.
// Descriptions © Green Map System, used with permission. See https://greenmap.org

export const greenMapIconDescriptions: Record<string, string> = ${JSON.stringify(descriptions, null, 2)}
`,
  )

  console.log(
    `Wrote ${entries.length} icons (${Math.round(originalBytes / 1024)} KB -> ${Math.round(optimisedBytes / 1024)} KB)`,
  )
}

await main()
