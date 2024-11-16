import Head from "next/head";
import "../styles/globals.css";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { Outfit } from "next/font/google";
import Script from "next/script";
import { useEffect } from "react";
import { useRouter } from "next/router";

config.autoAddCss = false;

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID;

function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url) => {
      window.gtag('config', GA_TRACKING_ID, {
        page_path: url,
      });
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <UserProvider>
      <Head>
        <link rel="icon" href="/favicon.png" />
      </Head>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_TRACKING_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
      <main className={`${outfit.variable} font-body`}>
        <Component {...pageProps} />
      </main>
    </UserProvider>
  );
}

export default App;
