
import { Html, Head, Main, NextScript } from 'next/document'
export default function Document(){
  return (
    <Html lang="tr">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin=""/>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet"/>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <meta name="theme-color" content="#1D3D6C"/>
      </Head>
      <body><Main/><NextScript/></body>
    </Html>
  )
}
