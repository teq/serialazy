import React from 'react';

import { Contents } from '../components/contents';
import { Footer } from '../components/footer';
import { Layout } from '../components/layout';
import { Meta } from '../components/meta';
import { getPageContent, getPageSlugs } from '../content';

import styles from './markdown.module.scss';

export type Props = {
  slug: string,
  frontmatter: { [prop: string]: any },
  githubLink: string,
  markdown: string,
};

export default function PageView({ slug, frontmatter, githubLink, markdown }: Props) {

  return (
    <Layout>
      <Meta subtitle={frontmatter.title}/>
      <div className="border-b lg:hidden">
        <section className="container mx-auto my-8 px-8">
          <Contents inline />
        </section>
      </div>
      <div className="flex container mx-auto px-8 lg:min-h-screen">
        <aside className="w-48 border-r mr-12 hidden lg:block">
          <div className="sticky top-0 pt-12">
            <Contents />
          </div>
        </aside>
        <div className="flex-1 min-w-0">
          <article
            className={styles.markdown}
            dangerouslySetInnerHTML={{ __html: markdown }}
          />
          <Footer githubLink={githubLink} />
        </div>
      </div>
    </Layout>
  );

}

type Params = {
  params: {
    slug: string
  }
};

export async function getStaticProps({ params: { slug } }: Params) {
  return {
    props: await getPageContent(slug)
  };
}

export async function getStaticPaths() {
  const slugs = await getPageSlugs();
  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: false,
  };
}
