import React, { ReactElement, ReactNode } from 'react';

type Props = {
  href: string,
  newTab?: boolean,
  children?: ReactNode,
};

export function ExternalLink({ href, newTab, children }: Props) {

  const anchor =
    typeof children !== 'string' &&
    React.Children.count(children) === 1 &&
    React.Children.only(children) as ReactElement;

  if (anchor && anchor.type === 'a') {

    return React.cloneElement(anchor, {
      href,
      target: newTab ? "_blank" : undefined,
      rel: "noopener noreferrer"
    });

  } else {

    return (
      <a
        href={href}
        target={newTab ? "_blank" : undefined}
        rel="noopener noreferrer"
      >
        { children }
      </a>
    );

  }

}
