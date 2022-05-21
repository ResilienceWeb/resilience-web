import Head from 'next/head'
import type { AppProps } from 'next/app'
import Script from 'next/script'
import { DefaultSeo } from 'next-seo'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { QueryClientProvider, QueryClient } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { SessionProvider } from 'next-auth/react'
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/500.css'
import '@fontsource/poppins/600.css'
import '../styles/colors.css'
import '../styles/styles.global.scss'
import StoreProvider from '@store/StoreProvider'

const theme = extendTheme({
    styles: {
        global: {
            'button:focus': {
                boxShadow: 'none !important',
            },
            'input:focus': {
                boxShadow: 'none !important',
            },
        },
    },
    colors: {
        rw: {
            600: '#6BA182',
            700: '#3A8159',
            900: '#09622f',
        },
    },
})

const queryClient = new QueryClient()

function App({ Component, pageProps }: AppProps) {
    return (
        <>
            <DefaultSeo
                title="Cambridge Resilience Web"
                openGraph={{
                    type: 'website',
                    locale: 'en_GB',
                    title: 'Cambridge Resilience Web',
                    description:
                        'A web of connections, showing local groups working to co-create a more socially and environmentally just city.',
                }}
            />
            <Head>
                <meta charSet="utf-8" />
                <meta property="og:locale" content="en_GB" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
                />
                <meta name="og:image" content="static/preview-image.png" />
                <link
                    rel="shortcut icon"
                    href="/favicon.ico"
                    type="image/x-icon"
                />
                <link rel="icon" href="/favicon.ico" type="image/x-icon" />
            </Head>
            <Script
                id="piwik-init"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                (function(window, document, dataLayerName, id) {
                    window[dataLayerName]=window[dataLayerName]||[],window[dataLayerName].push({start:(new Date).getTime(),event:"stg.start"});var scripts=document.getElementsByTagName('script')[0],tags=document.createElement('script');
                    function stgCreateCookie(a,b,c){var d="";if(c){var e=new Date;e.setTime(e.getTime()+24*c*60*60*1e3),d="; expires="+e.toUTCString()}document.cookie=a+"="+b+d+"; path=/"}
                    var isStgDebug=(window.location.href.match("stg_debug")||document.cookie.match("stg_debug"))&&!window.location.href.match("stg_disable_debug");stgCreateCookie("stg_debug",isStgDebug?1:"",isStgDebug?14:-1);
                    var qP=[];dataLayerName!=="dataLayer"&&qP.push("data_layer_name="+dataLayerName),isStgDebug&&qP.push("stg_debug");var qPString=qP.length>0?("?"+qP.join("&")):"";
                    tags.async=!0,tags.src="https://resilienceweb.containers.piwik.pro/"+id+".js"+qPString,scripts.parentNode.insertBefore(tags,scripts);
                    !function(a,n,i){a[n]=a[n]||{};for(var c=0;c<i.length;c++)!function(i){a[n][i]=a[n][i]||{},a[n][i].api=a[n][i].api||function(){var a=[].slice.call(arguments,0);"string"==typeof a[0]&&window[dataLayerName].push({event:n+"."+i+":"+a[0],parameters:[].slice.call(arguments,1)})}}(i[c])}(window,"ppms",["tm","cm"]);
                    })(window, document, 'dataLayer', 'f305cd48-97ec-425a-a7ba-f6f6a3a6c84b');
            `,
                }}
            />
            <SessionProvider
                refetchInterval={5 * 60}
                session={pageProps.session}
            >
                <QueryClientProvider client={queryClient}>
                    <StoreProvider>
                        <ChakraProvider theme={theme}>
                            <Component {...pageProps} />
                        </ChakraProvider>
                    </StoreProvider>
                    <ReactQueryDevtools initialIsOpen={false} />
                </QueryClientProvider>
            </SessionProvider>
        </>
    )
}

export default App
