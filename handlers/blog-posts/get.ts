import { cacheObject } from 'helpers/api/cacheObject'
import type { BlogPostsApiReply, BlogPostsReply } from 'helpers/types/blog-posts.types'
import type { NextApiRequest, NextApiResponse } from 'next'

const blogPosts = cacheObject<BlogPostsApiReply>(
  () =>
    fetch(
      `${process.env.BLOG_POSTS_API_URL}/content/posts/?key=${process.env.BLOG_POSTS_API_KEY}`,
      {
        method: 'GET',
        headers: {
          'Accept-Version': 'v5.71',
        },
      },
    ).then((resp) => resp.json()),
  60 * 60,
  'blog-posts',
)

export async function getBlogPosts(req: NextApiRequest, res: NextApiResponse) {
  if (!process.env.BLOG_POSTS_API_URL || !process.env.BLOG_POSTS_API_KEY) {
    res.status(500).json({ error: 'No BLOG_POSTS_API envs found' })
  }
  const filteredResult = await blogPosts().then(
    (result) =>
      result?.data.posts
        .filter((item) => item.visibility === 'public')
        .slice(0, 4)
        .map((item) => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          url: item.url,
          date: item.published_at,
        })) as BlogPostsReply,
  )
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate')
  return res.status(200).json(filteredResult)
}
