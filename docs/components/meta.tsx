import Head from 'next/head';

import { packageDescription, packageName } from '../package-info';

type Props = {
  subtitle?: string
};

export function Meta({ subtitle }: Props) {

  let title = subtitle ? `${packageName} - ${subtitle}` : packageName;

  return (
    <Head>

      <title>{title}</title>

      <link rel="icon" href="/assets/icons/favicon.ico" />
      <meta name="author" content="Andrey Tselishchev"></meta>
      <meta name="description" content={packageDescription} />

      <meta property="og:title" content={title} />
      <meta property="og:type" content="website" />
      {/* <meta property="og:image" content="" /> */}
      <meta property="og:description" content={packageDescription} />
      <meta property="og:site_name" content={packageName} />

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={packageDescription} />
      {/* <meta name="twitter:image" content="" /> */}
      <meta name="twitter:creator" content="@teqbwt" />

    </Head>
  );
}
