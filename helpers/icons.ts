import type { IconType } from 'react-icons'
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

export type IconEntry = {
  icon: IconType
  name: string
  category: string
}

export const icons: IconEntry[] = [
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

// Group icons by category
export const categories = [...new Set(icons.map((icon) => icon.category))]

// Icon names are stored in the database (Category.icon) as plain names like
// 'Leaf'. Names may also be namespaced by icon set (e.g. 'fa:Leaf') so that
// additional sets can be added later; bare names resolve to the Font Awesome
// set for backwards compatibility.
export const getIcon = (name?: string | null): IconEntry | undefined => {
  if (!name) return undefined
  const bareName = name.startsWith('fa:') ? name.slice(3) : name
  return icons.find((icon) => icon.name === bareName)
}
