import { promises as fs } from 'fs';
import path from 'path';
import { Metadata } from 'next';

interface BlogPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  return {
    title: `SREVE - ${params.slug.replace(/-/g, ' ')}`,
  };
}

export async function generateStaticParams(): Promise<BlogPageProps['params'][]> {
  const postsDirectory = path.join(process.cwd(), 'public/blogs');
  const filenames = await fs.readdir(postsDirectory);

  return filenames.map(filename => ({
    slug: filename.replace(/\.html$/, ''),
  }));
}

async function getPostContent(slug: string) {
  const filePath = path.join(process.cwd(), 'public/blogs', `${slug}.html`);
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
}

export default async function BlogPostPage({ params }: BlogPageProps) {
  const content = await getPostContent(params.slug);

  if (!content) return <div>Post not found</div>;

  return (
    <main>
      <div className="container">
        <div className="blog-post-content" dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </main>
  );
}