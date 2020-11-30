import { getPageContent } from '../content';
import PageView, { Props } from './[slug]';

export default function IndexPage(props: Props) {
  return <PageView {...props} />;
}

export async function getStaticProps() {
  return {
    props: await getPageContent('getting-started')
  };
}
