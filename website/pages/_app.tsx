import { AppProps } from 'next/app';
import React from 'react';

import '../styles/index.scss';

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
