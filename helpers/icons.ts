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

export const icons = [
  // Environment
  { icon: FaLeaf, name: 'Leaf', category: 'Environment', unicode: '\uf06c' },
  { icon: FaTree, name: 'Tree', category: 'Environment', unicode: '\uf1bb' },

  // Housing
  { icon: FaHome, name: 'Home', category: 'Housing', unicode: '\uf015' },
  {
    icon: FaBuilding,
    name: 'Building',
    category: 'Housing',
    unicode: '\uf1ad',
  },
  { icon: FaCity, name: 'City', category: 'Other', unicode: '\uf64f' },

  // Transportation
  { icon: FaCar, name: 'Car', category: 'Transportation', unicode: '\uf1b9' },
  { icon: FaBus, name: 'Bus', category: 'Transportation', unicode: '\uf207' },
  {
    icon: FaBicycle,
    name: 'Bicycle',
    category: 'Transportation',
    unicode: '\uf206',
  },

  // Energy
  { icon: FaWind, name: 'Wind', category: 'Energy', unicode: '\uf72e' },
  {
    icon: FaSolarPanel,
    name: 'SolarPanel',
    category: 'Energy',
    unicode: '\uf5ba',
  },
  { icon: FaFire, name: 'Fire', category: 'Energy', unicode: '\uf06d' },

  // Social Justice
  {
    icon: FaHandsHelping,
    name: 'HandsHelping',
    category: 'Social Justice',
    unicode: '\uf4c4',
  },
  {
    icon: FaBalanceScale,
    name: 'BalanceScale',
    category: 'Social Justice',
    unicode: '\uf24e',
  },
  {
    icon: FaHandHoldingHeart,
    name: 'HandHoldingHeart',
    category: 'Social Justice',
    unicode: '\uf4be',
  },
  {
    icon: FaFistRaised,
    name: 'FistRaised',
    category: 'Social Justice',
    unicode: '\uf6de',
  },
  {
    icon: FaHeart,
    name: 'Heart',
    category: 'Social Justice',
    unicode: '\uf004',
  },

  // Food
  { icon: FaAppleAlt, name: 'Apple', category: 'Food', unicode: '\uf5d1' },
  { icon: FaCarrot, name: 'Carrot', category: 'Food', unicode: '\uf787' },
  { icon: FaSeedling, name: 'Seedling', category: 'Food', unicode: '\uf4d8' },

  // Other
  { icon: FaTools, name: 'Tools', category: 'Other', unicode: '\uf7d9' },
  {
    icon: FaGraduationCap,
    name: 'Education',
    category: 'Other',
    unicode: '\uf19d',
  },
  { icon: FaDrum, name: 'Drum', category: 'Other', unicode: '\uf569' },
  { icon: FaFish, name: 'Fish', category: 'Other', unicode: '\uf578' },
  { icon: FaPaw, name: 'Paw', category: 'Other', unicode: '\uf1b0' },
  { icon: FaBlind, name: 'Blind', category: 'Other', unicode: '\uf29d' },
  { icon: FaCapsules, name: 'Capsules', category: 'Other', unicode: '\uf46b' },
  {
    icon: FaBabyCarriage,
    name: 'BabyCarriage',
    category: 'Other',
    unicode: '\uf77d',
  },
  { icon: FaBacteria, name: 'Bacteria', category: 'Other', unicode: '\ue059' },
  { icon: FaCoffee, name: 'Coffee', category: 'Other', unicode: '\uf0f4' },
  { icon: FaFlask, name: 'Flask', category: 'Other', unicode: '\uf0c3' },
  { icon: FaPalette, name: 'Palette', category: 'Other', unicode: '\uf53f' },
  { icon: FaGlobe, name: 'Globe', category: 'Other', unicode: '\uf0ac' },

  // Default
  {
    icon: FaMapMarkerAlt,
    name: 'default',
    category: 'Other',
    unicode: '\uf3c5',
  },
]

// Group icons by category
export const categories = [...new Set(icons.map((icon) => icon.category))]

export const getIconUnicode = (name: string) => {
  const icon = icons.find((icon) => icon.name === name)
  return icon?.unicode
}
