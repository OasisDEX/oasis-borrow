import { getBlogPosts } from 'handlers/blog-posts/get'
import type { NextApiHandler } from 'next'

const blogPostsHandler: NextApiHandler = async (req, res) => {
  if (req.method === 'GET') {
    return await getBlogPosts(req, res)
  }
  return res.status(405).end()
}

export default blogPostsHandler
