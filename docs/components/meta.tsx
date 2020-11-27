import Head from 'next/head';

export const SITE_TITLE = 'serialazy';
export const SITE_DESCRIPTION = "TypeScript class serialization / data-mapping library";

type Props = {
  subtitle?: string
};

export function Meta({ subtitle }: Props) {

  let title = subtitle ? `${SITE_TITLE} - ${subtitle}` : SITE_TITLE;

  return (
    <Head>

      <title>{title}</title>

      <link rel="icon" href="/assets/icons/favicon.ico" />
      <meta name="author" content="Andrey Tselishchev"></meta>
      <meta name="description" content={SITE_DESCRIPTION} />

      <meta property="og:title" content={title} />
      <meta property="og:type" content="website" />
      {/* <meta property="og:image" content="" /> */}
      <meta property="og:description" content={SITE_DESCRIPTION} />
      <meta property="og:site_name" content={SITE_TITLE} />

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={SITE_DESCRIPTION} />
      {/* <meta name="twitter:image" content="" /> */}
      <meta name="twitter:creator" content="@teqbwt" />

    </Head>
  );
}
