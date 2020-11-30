import cn from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';

import styles from './active-link.module.scss';

type Props = {
  href: string,
  match?: string,
  children?: ReactNode,
};

export function ActiveLink({ href, match, children }: Props) {

  const { asPath } = useRouter();

  const visiting = asPath === (match ?? href) || asPath.startsWith(`${match ?? href}#`);

  return (
    <Link href={href}>
      <a
        className={cn(visiting && styles.visiting)}
        suppressHydrationWarning
      >
        {children}
      </a>
    </Link>
  );

}
