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

async function getPostContent(slug: string) {
  const filePath = path.join(process.cwd(), 'public/blogs', `${slug}.html`);
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    return null;
  }
}

export function generateStaticParams(): BlogPageProps['params'][] {
  const slugs = ['post-1', 'post-2']; // Replace with dynamic fetch if needed
  return slugs.map(slug => ({ slug }));
}

export default async function BlogPostPage({ params }: BlogPageProps) {
  const content = await getPostContent(params.slug);

  if (!content) {
    return <div>Post not found</div>;
  }

  return (
    <main>
      <div className="container">
        <div className="blog-post-content" dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </main>
  );
}
