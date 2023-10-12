import { extractCritical } from 'emotion-server'
import { grooveWidgetScript } from 'features/grooveWidget'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import type { DocumentContext } from 'next/document'
import Document, { Head, Html, Main, NextScript } from 'next/document'
import Script from 'next/script'
import React from 'react'

export default class MyDocument extends Document<Document> {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx)
    const styles = extractCritical(initialProps.html)
    return {
      ...initialProps,
      styles: (
        <>
          {initialProps.styles}
          <style
            data-emotion-css={styles.ids.join(' ')}
            dangerouslySetInnerHTML={{ __html: styles.css }}
          />
        </>
      ),
    }
  }

  render() {
    return (
      <Html>
        <Head>
          <link rel="shortcut icon" href={staticFilesRuntimeUrl('/static/favicon.ico')} />
        </Head>
        <body>
          <Script strategy="beforeInteractive" >{grooveWidgetScript}</Script>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
