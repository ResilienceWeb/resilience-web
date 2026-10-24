import { createElement } from 'react'
import type { IconBaseProps, IconType } from 'react-icons'
import {
  FaLeaf,
  FaTree,
  FaHome,
  FaBuilding,
  FaCar,
  FaBus,
  FaBicycle,
  FaSolarPanel,
  FaWind,
  FaHandsHelping,
  FaBalanceScale,
  FaAppleAlt,
  FaCarrot,
  FaSeedling,
  FaTools,
  FaGraduationCap,
  FaHandHoldingHeart,
  FaFistRaised,
  FaFire,
  FaFlask,
  FaBacteria,
  FaBabyCarriage,
  FaBlind,
  FaCapsules,
  FaCity,
  FaCoffee,
  FaDrum,
  FaFish,
  FaPaw,
  FaPalette,
  FaMapMarkerAlt,
  FaHeart,
  FaGlobe,
} from 'react-icons/fa'
import { greenMapIcons } from '@helpers/green-map-icons'

export type IconSetId = 'fa' | 'gm'

export type IconEntry = {
  icon: IconType
  /** The value stored in the database, e.g. 'Leaf' or 'gm:food-bank'. */
  name: string
  label: string
  category: string
  set: IconSetId
  /** URL of the image behind an asset-backed icon. */
  src?: string
}

const fontAwesomeIcons: Omit<IconEntry, 'label' | 'set'>[] = [
  // Environment
  { icon: FaLeaf, name: 'Leaf', category: 'Environment' },
  { icon: FaTree, name: 'Tree', category: 'Environment' },

  // Housing
  { icon: FaHome, name: 'Home', category: 'Housing' },
  { icon: FaBuilding, name: 'Building', category: 'Housing' },
  { icon: FaCity, name: 'City', category: 'Other' },

  // Transportation
  { icon: FaCar, name: 'Car', category: 'Transportation' },
  { icon: FaBus, name: 'Bus', category: 'Transportation' },
  { icon: FaBicycle, name: 'Bicycle', category: 'Transportation' },

  // Energy
  { icon: FaWind, name: 'Wind', category: 'Energy' },
  { icon: FaSolarPanel, name: 'SolarPanel', category: 'Energy' },
  { icon: FaFire, name: 'Fire', category: 'Energy' },

  // Social Justice
  { icon: FaHandsHelping, name: 'HandsHelping', category: 'Social Justice' },
  { icon: FaBalanceScale, name: 'BalanceScale', category: 'Social Justice' },
  {
    icon: FaHandHoldingHeart,
    name: 'HandHoldingHeart',
    category: 'Social Justice',
  },
  { icon: FaFistRaised, name: 'FistRaised', category: 'Social Justice' },
  { icon: FaHeart, name: 'Heart', category: 'Social Justice' },

  // Food
  { icon: FaAppleAlt, name: 'Apple', category: 'Food' },
  { icon: FaCarrot, name: 'Carrot', category: 'Food' },
  { icon: FaSeedling, name: 'Seedling', category: 'Food' },

  // Other
  { icon: FaTools, name: 'Tools', category: 'Other' },
  { icon: FaGraduationCap, name: 'Education', category: 'Other' },
  { icon: FaDrum, name: 'Drum', category: 'Other' },
  { icon: FaFish, name: 'Fish', category: 'Other' },
  { icon: FaPaw, name: 'Paw', category: 'Other' },
  { icon: FaBlind, name: 'Blind', category: 'Other' },
  { icon: FaCapsules, name: 'Capsules', category: 'Other' },
  { icon: FaBabyCarriage, name: 'BabyCarriage', category: 'Other' },
  { icon: FaBacteria, name: 'Bacteria', category: 'Other' },
  { icon: FaCoffee, name: 'Coffee', category: 'Other' },
  { icon: FaFlask, name: 'Flask', category: 'Other' },
  { icon: FaPalette, name: 'Palette', category: 'Other' },
  { icon: FaGlobe, name: 'Globe', category: 'Other' },

  // Default
  { icon: FaMapMarkerAlt, name: 'default', category: 'Other' },
]

// Wraps an image in an <svg> sized like a react-icons icon, so it takes the
// same props and classes, and inlines into Leaflet marker HTML. The image
// keeps its own colours: Green Map's must not be recoloured.
const imageIcon = (src: string): IconType => {
  const ImageIcon = ({
    size,
    title,
    color: _color,
    children: _children,
    ...props
  }: IconBaseProps) =>
    createElement(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 1 1',
        width: size ?? '1em',
        height: size ?? '1em',
        ...props,
      },
      title ? createElement('title', null, title) : null,
      createElement('image', { href: src, width: 1, height: 1 }),
    )
  return ImageIcon
}

const greenMapEntries: IconEntry[] = greenMapIcons.map(
  ({ slug, name, category, file }) => {
    const src = `/icons/green-map/${file}`
    return {
      icon: imageIcon(src),
      name: `gm:${slug}`,
      label: name,
      category,
      set: 'gm',
      src,
    }
  },
)

const fontAwesomeEntries: IconEntry[] = fontAwesomeIcons.map((icon) => ({
  ...icon,
  label: icon.name,
  set: 'fa',
}))

export const icons: IconEntry[] = [...fontAwesomeEntries, ...greenMapEntries]

type IconSet = {
  id: IconSetId
  label: string
  icons: IconEntry[]
  categories: string[]
}

export const iconSets: IconSet[] = (
  [
    { id: 'fa', label: 'Font Awesome', icons: fontAwesomeEntries },
    { id: 'gm', label: 'Green Map', icons: greenMapEntries },
  ] as const
).map((set) => {
  const choosable = set.icons.filter((icon) => icon.name !== 'default')
  return {
    ...set,
    icons: choosable,
    categories: [...new Set(choosable.map((icon) => icon.category))].sort(),
  }
})

const iconsByName = new Map(icons.map((icon) => [icon.name, icon]))

// Font Awesome names are stored bare ('Leaf'), as they were before there was
// more than one set; 'fa:Leaf' resolves too. Other sets are always namespaced.
export const getIcon = (name?: string | null): IconEntry | undefined => {
  if (!name) return undefined
  return iconsByName.get(name.startsWith('fa:') ? name.slice(3) : name)
}

/** Whether a value may be saved as a tag or category icon. */
export const isSelectableIcon = (name: unknown): name is string =>
  typeof name === 'string' && name !== 'default' && Boolean(getIcon(name))
