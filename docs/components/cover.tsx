import cn from 'classnames';
import Link from 'next/link';

import { packageDescription, packageName, packageVersion } from '../package-info';
import { ExternalLink } from './external-link';

import styles from './cover.module.scss';

export function Cover() {

  return (
    <div className="min-h-screen min-w-full flex items-center bg-gradient-to-bl from-cover1 to-cover2">
      <div className="flex-1 text-center font-light">
        <h1 className="relative text-6xl my-8">
          {packageName}
          <small className="absolute bottom-0 text-base">{packageVersion}</small>
        </h1>
        <p className="text-xl my-8">
          {packageDescription}
        </p>
        <ul className="my-8">
          <li>Class inheritance</li>
          <li>Recursive serialization</li>
          <li>Custom serializers for properties/types</li>
          <li>TypeScript-friendly API based on decorators</li>
          <li>... and more 👇</li>
        </ul>
        <div className="my-8 font-normal">
          <ExternalLink newTab href="https://github.com/teq/serialazy">
            <a className={styles.button}>GitHub</a>
          </ExternalLink>
          <ExternalLink newTab href="https://www.npmjs.com/package/serialazy">
            <a className={styles.button}>NPM</a>
          </ExternalLink>
          <Link href="/#getting-started">
            <a className={cn(styles.button, styles.button_primary)}>Getting Started</a>
          </Link>
        </div>
      </div>
    </div>
  );

}
