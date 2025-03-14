import Link from 'next/link'
import type { ReactNode } from 'react'
import { FaGithub, FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa'
import Image from 'next/legacy/image'

import { REMOTE_URL } from '@helpers/config'
import SignupForm from '@components/signup-form'
import LogoImage from '../../public/logo.png'

const SocialButton = ({
  children,
  label,
  href,
}: {
  children: ReactNode
  label: string
  href: string
}) => {
  return (
    <a
      className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/10 transition-colors duration-300 hover:bg-black/20"
      href={href}
      target="_blank"
    >
      <span className="sr-only">{label}</span>
      {children}
    </a>
  )
}

const ListHeader = ({ children }: { children: ReactNode }) => {
  return <h3 className="mb-2 text-lg">{children}</h3>
}

export default function Footer({ hideBorder = false }) {
  return (
    <div
      className={`bg-[#fcfcfc] text-gray-600 ${
        !hideBorder ? 'border-t border-t-gray-200' : ''
      }`}
    >
      <div className="w-full max-w-[100vw] px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-[2fr_1fr_2fr]">
          <div className="flex flex-col gap-2">
            <div>
              <Image
                alt="Resilience Web CIC logo"
                src={LogoImage}
                width="148"
                height="55"
                unoptimized
              />
            </div>
            <Link
              className="font-semibold hover:text-gray-900"
              href="https://dinerismail.dev"
              target="_blank"
            >
              Built with ❤️ <span style={{ marginLeft: '3px' }}>by Diner</span>
            </Link>
            <div className="flex gap-3">
              <SocialButton
                label="Facebook"
                href="https://www.facebook.com/resilienceweb"
              >
                <FaFacebook />
              </SocialButton>
              <SocialButton
                label="Instagram"
                href="https://instagram.com/resilienceweb"
              >
                <FaInstagram />
              </SocialButton>
              <SocialButton
                label="LinkedIn"
                href="https://www.linkedin.com/company/resilience-web"
              >
                <FaLinkedin />
              </SocialButton>
              <SocialButton
                label="Github"
                href="https://github.com/ResilienceWeb/resilience-web"
              >
                <FaGithub />
              </SocialButton>
            </div>
            <p className="text-sm">
              Resilience Web CIC - Company number 15322382
            </p>
            <p className="text-sm">
              Content on this site is in the public domain under a{' '}
              <a
                href="https://creativecommons.org/licenses/by/4.0"
                target="_blank"
              >
                Creative Commons CC BY 4.0 license
              </a>
              .
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <ListHeader>Useful links</ListHeader>
            <Link href={`${REMOTE_URL}/admin`}>Admin login</Link>
            <Link href={`${REMOTE_URL}/about`}>About us</Link>
            <Link href="https://resilienceweb.gitbook.io" target="_blank">
              Knowledgebase
            </Link>
            <Link
              href="https://opencollective.com/resilience-web/donate"
              target="_blank"
              rel="noreferrer"
            >
              Donate
            </Link>
          </div>
          <div>
            <ListHeader>Stay up to date</ListHeader>
            <SignupForm />
          </div>
        </div>
      </div>
    </div>
  )
}
