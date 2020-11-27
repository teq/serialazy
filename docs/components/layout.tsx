import { useRouter } from 'next/router';
import { ReactNode } from 'react';

import { Cover } from  './cover';
import { Meta } from './meta';

type Props = {
  children: ReactNode
};

export function Layout({ children }: Props) {

  const { asPath } = useRouter();

  return (
    <>
      <Meta />
      <header suppressHydrationWarning>
        {asPath === '/' && <Cover />}
      </header>
      <main>{children}</main>
    </>
  );

}
