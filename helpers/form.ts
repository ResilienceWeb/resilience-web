import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaMastodon,
} from 'react-icons/fa'

const urlRegex = new RegExp(/^[a-zA-Z0-9\-]*$/)

export const urlValidator = (value: string) => {
  return urlRegex.test(value) ? true : false
}

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
