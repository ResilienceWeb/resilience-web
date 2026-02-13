'use client'

import { useState } from 'react'
import { HiDownload, HiClipboard, HiCheck } from 'react-icons/hi'
import Image from 'next/image'
import { Button } from '@components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui/card'

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

export default function ResourcesPage() {
  return (
    <div className="mb-6 flex flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Resources</h1>
        <p className="text-muted-foreground">
          Download resources and materials to help promote your connection to
          the Resilience Web community.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rectangular Badge</CardTitle>
            <CardDescription>
              A wide format badge suitable for website headers and footers
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="overflow-hidden rounded-lg border">
              <Image
                src="/proud-member.png"
                alt="Proud to be part of Resilience Web"
                width={400}
                height={140}
                className="h-auto w-full"
              />
            </div>
            <Button
              onClick={() => downloadImage('proud-member.png')}
              className="w-full"
            >
              <HiDownload className="mr-2 h-4 w-4" />
              Download Rectangular Badge
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Square Badge</CardTitle>
            <CardDescription>
              A square format badge perfect for social media and profile
              pictures
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="overflow-hidden rounded-lg border">
              <Image
                src="/proud-member-square.png"
                alt="Proud to be part of Resilience Web"
                width={300}
                height={300}
                className="h-auto w-full"
              />
            </div>
            <Button
              onClick={() => downloadImage('proud-member-square.png')}
              className="w-full"
            >
              <HiDownload className="mr-2 h-4 w-4" />
              Download Square Badge
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Embed Code</CardTitle>
            <CardDescription>
              Add this code to your website to show your connection to the
              Resilience Web community
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
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
