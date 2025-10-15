import {
  FaEnvelope,
  FaHandHoldingHeart,
  FaDonate,
  FaNewspaper,
  FaBook,
} from 'react-icons/fa'

export const actionTypes = [
  {
    id: 'volunteer',
    label: 'Volunteer',
    icon: FaHandHoldingHeart,
    color: '#8B5CF6',
  },
  {
    id: 'contact',
    label: 'Contact',
    icon: FaEnvelope,
    color: '#3B82F6',
  },
  {
    id: 'donate',
    label: 'Donate',
    icon: FaDonate,
    color: '#25AB2C',
  },
  {
    id: 'newsletter',
    label: 'Newsletter',
    icon: FaNewspaper,
    color: '#6366F1',
  },
  {
    id: 'resources',
    label: 'Resources',
    icon: FaBook,
    color: '#EC4899',
  },
]

export const actionIconStyles = {
  donate: {
    bgClass: 'bg-green-50',
    textClass: 'text-green-600/70',
    ringClass: 'ring-green-100/50',
    hoverBgClass: 'hover:bg-green-100',
    hoverTextClass: 'hover:text-green-600',
    hoverRingClass: 'hover:ring-green-200',
  },
  volunteer: {
    bgClass: 'bg-purple-50',
    textClass: 'text-purple-600/70',
    ringClass: 'ring-purple-100/50',
    hoverBgClass: 'hover:bg-purple-100',
    hoverTextClass: 'hover:text-purple-600',
    hoverRingClass: 'hover:ring-purple-200',
  },
  contact: {
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-600/70',
    ringClass: 'ring-blue-100/50',
    hoverBgClass: 'hover:bg-blue-100',
    hoverTextClass: 'hover:text-blue-600',
    hoverRingClass: 'hover:ring-blue-200',
  },
  newsletter: {
    bgClass: 'bg-indigo-50',
    textClass: 'text-indigo-600/70',
    ringClass: 'ring-indigo-100/50',
    hoverBgClass: 'hover:bg-indigo-100',
    hoverTextClass: 'hover:text-indigo-600',
    hoverRingClass: 'hover:ring-indigo-200',
  },
  resources: {
    bgClass: 'bg-pink-50',
    textClass: 'text-pink-600/70',
    ringClass: 'ring-pink-100/50',
    hoverBgClass: 'hover:bg-pink-100',
    hoverTextClass: 'hover:text-pink-600',
    hoverRingClass: 'hover:ring-pink-200',
  },
}
