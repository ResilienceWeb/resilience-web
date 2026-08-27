import localFont from 'next/font/local'

/**
 * Poppins, self-hosted from the two weights the site uses.
 *
 * These are the same files `@fontsource/poppins` shipped, but loading them
 * through `next/font` adds the two things it could not:
 *
 * - a `<link rel="preload">` in the head, so the request starts with the HTML
 *   rather than after the stylesheet declaring the `@font-face` has been
 *   fetched and parsed;
 * - a `size-adjust`ed Arial fallback, so the swap from fallback to Poppins does
 *   not re-wrap the page underneath it.
 *
 * Deliberately `next/font/local` rather than `next/font/google`: the Google
 * loader fetches at build time, which would make every deploy — including the
 * nightly one — depend on fonts.googleapis.com being reachable.
 */
export const poppins = localFont({
  src: [
    {
      path: './fonts/poppins-latin-400-normal.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/poppins-latin-600-normal.woff2',
      weight: '600',
      style: 'normal',
    },
  ],
  variable: '--font-poppins',
  display: 'swap',
})
