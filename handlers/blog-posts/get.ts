import { cacheObject } from 'helpers/api/cacheObject'
import type {
  BlogPost,
  BlogPostsApiReply,
  BlogPostsReply,
  ParsedBlogPost,
} from 'helpers/types/blog-posts.types'
import { shuffle } from 'lodash'
import type { NextApiRequest, NextApiResponse } from 'next'

const blogPostsFetchUrl = `${process.env.BLOG_POSTS_API_URL}/content/posts/?key=${process.env.BLOG_POSTS_API_KEY}&filter=visibility:public`
const blogPostsFetchOptions = {
  method: 'GET',
  headers: {
    'Accept-Version': 'v5.71',
  },
}

const blogPostsNews = cacheObject<BlogPostsApiReply>(
  () => fetch(`${blogPostsFetchUrl}&limit=4`, blogPostsFetchOptions).then((resp) => resp.json()),
  60 * 60,
  'blog-posts-news',
)

const blogPostsLearn = cacheObject<BlogPostsApiReply>(
  () =>
    fetch(`${blogPostsFetchUrl}&filter=tag:learn`, blogPostsFetchOptions).then((resp) =>
      resp.json(),
    ),
  60 * 60,
  'blog-posts-learn',
)

function parseBlogPost({
  id,
  feature_image,
  published_at,
  reading_time,
  slug,
  title,
  url,
}: BlogPost): ParsedBlogPost {
  return {
    date: published_at,
    image: feature_image,
    id,
    readingTime: reading_time,
    slug,
    title,
    url,
  }
}

export async function getBlogPosts(req: NextApiRequest, res: NextApiResponse) {
  if (!process.env.BLOG_POSTS_API_URL || !process.env.BLOG_POSTS_API_KEY) {
    res.status(500).json({ error: 'No BLOG_POSTS_API envs found' })
  }
  const filteredResult = await Promise.all([blogPostsNews(), blogPostsLearn()]).then(
    ([resultsNews, resultsLearn]) => {
      return {
        news: resultsNews?.data.posts.map(parseBlogPost),
        learn: shuffle(resultsLearn?.data.posts.map(parseBlogPost)).slice(0, 3),
      } as BlogPostsReply
    },
  )

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate')

  return res.status(200).json(filteredResult)
}
