'use client' // Error boundaries must be Client Components

import NextError from 'next/error'

export default function GlobalError({
  _error,
}: {
  _error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  )
}
