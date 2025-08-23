
import Link from 'next/link';
import { promises as fs } from 'fs';
import path from 'path';

export default async function BlogPage() {
  const postsDirectory = path.join(process.cwd(), 'public/blogs');
  const filenames = await fs.readdir(postsDirectory);

  return (
    <main>
        <div className="container">
            <h1 className="blog-title">Blog</h1>
            <ul className="blog-post-list">
                {filenames.map((filename) => {
                const slug = filename.replace(/\.html$/, '');
                return (
                    <li key={slug} className="blog-post-list-item">
                    <Link href={`/blog/${slug}`}>{slug.replace(/-/g, ' ')}</Link>
                    </li>
                );
                })}
            </ul>
        </div>
    </main>
  );
}
