'use client'

import { useState } from 'react'
import { HiDownload, HiClipboard, HiCheck } from 'react-icons/hi'
import { Button } from '@components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'

const downloadImage = (filename: string) => {
  const link = document.createElement('a')
  link.href = `/${filename}`
  link.download = `resilience-web-member-${filename}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const codeSnippet = `<a href="https://resilienceweb.org.uk" target="_blank">
  <img width="400" height="140" src="https://resilienceweb.org.uk/proud-member.png" alt="Proud to be part of Resilience Web" />
</a>
`

const CodeSnippet = () => {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(codeSnippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm text-slate-50">
        <code>{codeSnippet}</code>
      </pre>
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2 h-8 w-8 p-0"
        onClick={copyToClipboard}
      >
        {copied ? (
          <HiCheck className="h-4 w-4 text-green-500" />
        ) : (
          <HiClipboard className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}

const badges = [
  {
    title: 'Rectangular Badge',
    filename: 'proud-member.png',
    width: 400,
    height: 140,
    transparent: false,
  },
  {
    title: 'Square Badge',
    filename: 'proud-member-square.png',
    width: 300,
    height: 300,
    transparent: false,
  },
  {
    title: 'Rectangular Badge (Transparent)',
    filename: 'proud-member-transparent.png',
    width: 400,
    height: 140,
    transparent: true,
  },
  {
    title: 'Square Badge (Transparent)',
    filename: 'proud-member-square-transparent.png',
    width: 300,
    height: 300,
    transparent: true,
  },
]

export default function ResourcesPage() {
  return (
    <div className="mb-6 flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Resources</h1>
        <p className="text-muted-foreground">
          Download resources and materials to help promote your connection to
          the Resilience Web community.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {badges.map((badge) => (
          <Card key={badge.filename}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{badge.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div
                className={`overflow-hidden rounded-lg border ${badge.transparent ? 'bg-[repeating-conic-gradient(#e5e7eb_0%_25%,transparent_0%_50%)] bg-size-[16px_16px]' : ''}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/${badge.filename}`}
                  alt="Proud to be part of Resilience Web"
                  width={badge.width}
                  height={badge.height}
                  className="h-auto w-full"
                />
              </div>
              <Button
                onClick={() => downloadImage(badge.filename)}
                size="sm"
                className="w-full"
              >
                <HiDownload className="mr-2 h-4 w-4" />
                Download
              </Button>
            </CardContent>
          </Card>
        ))}

        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Embed Code</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <CodeSnippet />
            <p className="text-muted-foreground text-sm">
              Copy and paste this code into your website&apos;s HTML where
              you&apos;d like the badge to appear.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
