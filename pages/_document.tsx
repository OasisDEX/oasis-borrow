import { PWATags } from 'components/HeadTags'
import { extractCritical } from 'emotion-server'
import Document, { DocumentContext, Head, Html, Main, NextScript } from 'next/document'
import React from 'react'
import { InjectTokenIconsDefs } from 'theme/tokenIcons'

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
          <PWATags />
        </Head>
        <body>
          <InjectTokenIconsDefs />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
