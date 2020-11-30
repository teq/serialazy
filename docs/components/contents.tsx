import cn from 'classnames';
import Link from 'next/link';

import { ActiveLink } from '../components/active-link';
import { packageName, packageVersion } from '../package-info';

import styles from './contents.module.scss';

type Props = {
  inline?: boolean,
};

export function Contents({ inline }: Props) {

  return (

    <div className={cn(styles.contents, inline && styles.inline)}>

      <Link href="/"><a>
        <h1 className="relative text-3xl mb-4">
          { packageName }
          <small className="absolute bottom-0 text-xs">{ packageVersion }</small>
        </h1>
      </a></Link>

      <ul>
        <li><ActiveLink href="/#getting-started" match="/">Getting Started</ActiveLink></li>
        <li><ActiveLink href="/options">Options</ActiveLink></li>
        <li><ActiveLink href="/inheritance">Class Inheritance</ActiveLink></li>
        <li><ActiveLink href="/async">Async Serialization</ActiveLink></li>
        <li><ActiveLink href="/projections">Projections</ActiveLink></li>
        <li><ActiveLink href="/pojo">POJO</ActiveLink></li>
        <li><ActiveLink href="/changelog">Changelog</ActiveLink></li>
      </ul>

    </div>

  );

}
