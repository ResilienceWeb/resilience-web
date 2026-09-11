import babel from '@babel/core'
import type { Plugin } from 'vite'

/**
 * Runs the React Compiler over the app's components the way `next build` does,
 * with the same `babel-plugin-react-compiler` the build uses.
 *
 * Without it the tests run over unmemoised source, and a component whose
 * memoisation freezes a value it should keep reading passes here while being
 * broken in the browser.
 *
 * `@vitejs/plugin-react`'s own `compiler` option runs an oxc port of the
 * compiler, and only in the client environment — which the jsdom tests are not.
 */
export function reactCompiler(): Plugin {
  return {
    name: 'test:react-compiler',
    enforce: 'pre',
    async transform(code, id) {
      const file = id.split('?')[0]
      if (file.includes('/node_modules/') || !/\.[jt]sx$/.test(file)) return

      // Only the compiler runs here; TypeScript and JSX are parsed and printed
      // straight back out for Vite's own transform to strip afterwards.
      const result = await babel.transformAsync(code, {
        filename: id,
        babelrc: false,
        configFile: false,
        sourceMaps: true,
        parserOpts: { plugins: ['typescript', 'jsx'] },
        plugins: [['babel-plugin-react-compiler', {}]],
      })

      if (!result?.code) return
      return { code: result.code, map: result.map }
    },
  }
}
