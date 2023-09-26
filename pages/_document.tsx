import { PWATags } from 'components/HeadTags'
import { extractCritical } from 'emotion-server'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import type { DocumentContext } from 'next/document'
import Document, { Head, Html, Main, NextScript } from 'next/document'
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
          <link href={EXTERNAL_LINKS.INTER_FONT} rel="stylesheet" />
          <link rel="shortcut icon" href={staticFilesRuntimeUrl('/static/favicon.ico')} />
          <PWATags />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
