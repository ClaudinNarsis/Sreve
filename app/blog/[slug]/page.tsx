
import { promises as fs } from 'fs';
import path from 'path';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
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

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
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
