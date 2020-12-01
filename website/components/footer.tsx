import { ExternalLink } from './external-link';

type Props = {
  githubLink?: string,
};

export function Footer({ githubLink }: Props) {

  const year = new Date().getFullYear();

  return (
    <footer className="flex justify-between flex-wrap border-t mt-12 py-8 text-sm text-gray-600">
      <span className="mx-2">© 2017 - {year} Andrey Tselishchev</span>
      <span className="mx-2">Site powered by <ExternalLink href="https://nextjs.org/" newTab>next.js</ExternalLink></span>
      { githubLink && <span className="mx-2">
        <ExternalLink href={githubLink} newTab>
          <img className="inline w-4 h-4 mx-1" src="/assets/icons/external-link.svg" />
          Edit on GitHub
        </ExternalLink>
      </span> }
    </footer>
  );

}
