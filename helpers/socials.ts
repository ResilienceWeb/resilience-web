import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaMastodon,
} from 'react-icons/fa'
import { FaBluesky } from 'react-icons/fa6'

export const socialMediaPlatforms = [
  {
    id: 'facebook',
    label: 'Facebook',
    prefix: 'https://facebook.com/',
    icon: FaFacebook,
    color: '#1877F2',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    prefix: 'https://linkedin.com/in/',
    icon: FaLinkedin,
    color: '#0A66C2',
  },

  {
    id: 'instagram',
    label: 'Instagram',
    prefix: 'https://instagram.com/',
    icon: FaInstagram,
    color: '#E4405F',
  },
  {
    id: 'bluesky',
    label: 'Bluesky',
    prefix: 'https://bluesky.app/',
    icon: FaBluesky,
    color: '#208BFE',
  },
  {
    id: 'twitter',
    label: 'Twitter',
    prefix: 'https://twitter.com/',
    icon: FaTwitter,
    color: '#000000',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    prefix: 'https://youtube.com/',
    icon: FaYoutube,
    color: '#FF0000',
  },
  {
    id: 'mastodon',
    label: 'Mastodon',
    prefix: 'https://',
    icon: FaMastodon,
    color: '#6364FF',
  },
]

// icon styles: h-5 w-5 transition-transform group-hover:scale-110
export const socialIconStyles = {
  facebook: {
    bgClass: 'bg-blue-50',
    textClass: 'text-[#1877F2]/70',
    ringClass: 'ring-blue-100/50',
    hoverBgClass: 'hover:bg-blue-100',
    hoverTextClass: 'hover:text-[#1877F2]',
    hoverRingClass: 'hover:ring-blue-200',
  },
  instagram: {
    bgClass: 'bg-pink-50',
    textClass: 'text-[#E4405F]/70',
    ringClass: 'ring-pink-100/50',
    hoverBgClass: 'hover:bg-pink-100',
    hoverTextClass: 'hover:text-[#E4405F]',
    hoverRingClass: 'hover:ring-pink-200',
  },
  bluesky: {
    bgClass: 'bg-blue-50',
    textClass: 'text-[#208BFE]/70',
    ringClass: 'ring-blue-100/50',
    hoverBgClass: 'hover:bg-blue-100',
    hoverTextClass: 'hover:text-[#208BFE]',
    hoverRingClass: 'hover:ring-blue-200',
  },
  twitter: {
    bgClass: 'bg-blue-50',
    textClass: 'text-[#1DA1F2]/70',
    ringClass: 'ring-blue-100/50',
    hoverBgClass: 'hover:bg-blue-100',
    hoverTextClass: 'hover:text-[#1DA1F2]',
    hoverRingClass: 'hover:ring-blue-200',
  },
  linkedin: {
    bgClass: 'bg-blue-50',
    textClass: 'text-[#0A66C2]/70',
    ringClass: 'ring-blue-100/50',
    hoverBgClass: 'hover:bg-blue-100',
    hoverTextClass: 'hover:text-[#0A66C2]',
    hoverRingClass: 'hover:ring-blue-200',
  },
  youtube: {
    bgClass: 'bg-red-50',
    textClass: 'text-[#FF0000]/70',
    ringClass: 'ring-red-100/50',
    hoverBgClass: 'hover:bg-red-100',
    hoverTextClass: 'hover:text-[#FF0000]',
    hoverRingClass: 'hover:ring-red-200',
  },
  mastodon: {
    bgClass: 'bg-purple-50',
    textClass: 'text-[#6364FF]/70',
    ringClass: 'ring-purple-100/50',
    hoverBgClass: 'hover:bg-purple-100',
    hoverTextClass: 'hover:text-[#6364FF]',
    hoverRingClass: 'hover:ring-purple-200',
  },
}
