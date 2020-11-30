import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import rehypeAutolink from 'rehype-autolink-headings';
import rehypeShiki from 'rehype-shiki';
import rehypeSlug from 'rehype-slug';
import rehypeHtml from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remark2rehype from 'remark-rehype';
import unified from 'unified';

import { repositoryUrl } from '../package-info';

const PAGES_DIR = path.resolve(process.cwd(), 'content');

export async function getPageSlugs(): Promise<string[]> {
  const filenames = await fs.promises.readdir(PAGES_DIR);
  return filenames
    .map(filename => filename.match(/^(.+)\.page\.md$/)?.[1])
    .filter((slug): slug is string => typeof slug === 'string');
}

export async function getPageContent(slug: string) {

  const relPath = `content/${slug}.page.md`;
  const buffer = await fs.promises.readFile(path.resolve(process.cwd(), relPath));

  const { data: frontmatter, content } = matter(buffer);

  const renderedMarkdown = await unified()
    .use(remarkParse)
    .use(remark2rehype)
    .use(rehypeSlug)
    .use(rehypeAutolink)
    .use(rehypeShiki)
    .use(rehypeHtml)
    .process(content);

  return {
    slug,
    frontmatter,
    githubLink: `${repositoryUrl}/tree/master/docs/${relPath}`,
    markdown: renderedMarkdown.toString()
  };

}
