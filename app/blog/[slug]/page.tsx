import { promises as fs } from 'fs';
import path from 'path';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `SREVE - ${slug.replace(/-/g, ' ')}`,
  };
}

export function generateStaticParams() {
  const slugs = ['post-1', 'post-2'];
  return slugs.map(slug => ({ slug }));
}

async function getPostContent(slug: string) {
  const filePath = path.join(process.cwd(), 'public/blogs', `${slug}.html`);
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = await getPostContent(slug);

  if (!content) return <div>Post not found</div>;

  return (
    <main>
      <div className="container">
        <div
          className="blog-post-content"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </main>
  );
}