import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://sreve.online'
  
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/learn`,
      lastModified: new Date('2025-10-31'),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tools/blog-generator`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tools/viral-post-generator`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tools/ai-content-generator`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/ai-caption-generator`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/ai-sentence-rewriter`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/blog-idea-generator`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/social-media-post-generator`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/content-marketing-ai`,
      lastModified: new Date('2025-01-29'),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tools/content-calendar-generator`,
      lastModified: new Date('2025-01-16'),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    // Phase 1: Social Media Content Ideas Cluster - January 2025
    {
      url: `${baseUrl}/blog/177-social-media-content-ideas-2025`,
      lastModified: new Date('2025-01-12'),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog/social-media-content-ideas-when-stuck`,
      lastModified: new Date('2025-01-13'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/never-run-out-social-media-content-ideas`,
      lastModified: new Date('2025-01-14'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/viral-social-media-content-ideas-free`,
      lastModified: new Date('2025-01-15'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    // Day 2 AI Story Generator Content Cluster - October 31, 2025
    {
      url: `${baseUrl}/blog/the-problem-with-ai-story-generators-no-soul`,
      lastModified: new Date('2025-10-31'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/how-we-built-story-generator-feels-human`,
      lastModified: new Date('2025-10-31'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/ai-can-write-stories-but-can-it-feel-them`,
      lastModified: new Date('2025-10-31'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/ai-story-generator`,
      lastModified: new Date('2025-10-31'),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/learn/how-ai-storytelling-evolved`,
      lastModified: new Date('2025-10-31'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    // Day 3 AI Text Generator Content Cluster - November 2, 2025
    {
      url: `${baseUrl}/blog/ai-text-generator-gets-your-tone-right`,
      lastModified: new Date('2025-11-02'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/ai-text-generators-sound-like-wikipedia`,
      lastModified: new Date('2025-11-02'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/make-ai-write-like-human-not-grammar-bot`,
      lastModified: new Date('2025-11-02'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/ai-text-generator`,
      lastModified: new Date('2025-11-02'),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/learn/best-ai-text-generators-2025`,
      lastModified: new Date('2025-11-02'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    // Day 1 AI Chat Content Cluster - Creator Chat Revolution
    {
      url: `${baseUrl}/blog/ai-chat-is-dead-meet-creator-chat-revolution`,
      lastModified: new Date('2025-01-30'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/why-your-ai-chatbot-sounds-boring`,
      lastModified: new Date('2025-01-30'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/creators-need-ai-collaboration-not-chat`,
      lastModified: new Date('2025-01-30'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/ai-chat`,
      lastModified: new Date('2025-01-30'),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/learn/ai-chat-vs-creator-chat`,
      lastModified: new Date('2025-01-30'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    // Phase 4 New Content Cluster - October 2025
    {
      url: `${baseUrl}/blog/viral-post-ideas-generator-2025`,
      lastModified: new Date('2025-10-23'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/ai-content-writer-for-business-2025`,
      lastModified: new Date('2025-10-23'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/best-caption-generator-instagram-2025`,
      lastModified: new Date('2025-10-23'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/content-creation-tools-comparison-2025`,
      lastModified: new Date('2025-10-23'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/marketing-automation-ai-tools-2025`,
      lastModified: new Date('2025-10-23'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    // Phase 2 Blog Generator Content Cluster
    {
      url: `${baseUrl}/blog/free-blog-generator-tools-2025`,
      lastModified: new Date('2025-01-15'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/ai-blog-generator-vs-manual-writing`,
      lastModified: new Date('2025-01-18'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/blog-generator-for-small-businesses`,
      lastModified: new Date('2025-01-20'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/how-to-use-ai-for-blog-content-creation`,
      lastModified: new Date('2025-01-22'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    // Phase 2 Viral Post Generator Content Cluster
    {
      url: `${baseUrl}/blog/viral-post-generator-guide`,
      lastModified: new Date('2025-01-24'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/linkedin-post-generator`,
      lastModified: new Date('2025-01-26'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/social-media-post-generator-tools-2025`,
      lastModified: new Date('2025-01-28'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/create-viral-content-with-ai`,
      lastModified: new Date('2025-01-30'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    // Phase 3 Supporting Content
    {
      url: `${baseUrl}/blog/how-ai-is-transforming-content-marketing-2025`,
      lastModified: new Date('2025-01-17'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/best-ai-tools-for-marketing-agencies`,
      lastModified: new Date('2025-01-17'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/social-media-content-calendar-with-ai`,
      lastModified: new Date('2025-01-17'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/ai-caption-generator-vs-manual-writing`,
      lastModified: new Date('2025-01-17'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/how-to-create-viral-content-with-ai`,
      lastModified: new Date('2025-01-17'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/instagram-caption-ideas-for-business`,
      lastModified: new Date('2025-01-17'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/content-marketing-strategy-small-business`,
      lastModified: new Date('2025-01-17'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/ai-vs-human-content-writers`,
      lastModified: new Date('2025-01-17'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/save-money-content-creation-ai`,
      lastModified: new Date('2025-01-17'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    // Phase 5 High-Intent Copywriting Keywords Cluster
    {
      url: `${baseUrl}/blog/best-ai-copywriting-tools-for-agencies-2025`,
      lastModified: new Date('2025-01-28'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/affordable-copywriting-software-save-3000-per-year`,
      lastModified: new Date('2025-01-28'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/free-trial-ai-copywriting-tools-2025`,
      lastModified: new Date('2025-01-28'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/copywriting-tool-pricing-comparison-2025`,
      lastModified: new Date('2025-01-28'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/content-creation-tools-for-performance-marketers`,
      lastModified: new Date('2025-01-28'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    // Phase 6 Content Marketing Guide Cluster - January 29, 2025
    {
      url: `${baseUrl}/blog/ultimate-content-marketing-guide-2025`,
      lastModified: new Date('2025-01-29'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/content-marketing-tools-comparison`,
      lastModified: new Date('2025-01-29'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/content-marketing-strategy-agencies`,
      lastModified: new Date('2025-01-29'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/scale-content-marketing-budget`,
      lastModified: new Date('2025-01-29'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    // Existing blog posts
    {
      url: `${baseUrl}/blog/create-viral-posts-with-ai`,
      lastModified: new Date('2025-02-01'),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/ai-tools-social-media-marketing-2025`,
      lastModified: new Date('2025-02-15'),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/best-ai-tools-content-marketing-2025`,
      lastModified: new Date('2025-03-05'),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/cheaper-jasper-alternative-2025`,
      lastModified: new Date('2025-01-27'),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/top-5-tools-for-creative-and-marketing-agencies`,
      lastModified: new Date('2025-08-23'),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/sign-in`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/sign-up`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ]

  return routes
}