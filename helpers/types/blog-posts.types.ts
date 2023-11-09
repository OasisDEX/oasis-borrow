export type BlogPost = {
  access: boolean
  comment_id: string
  comments: boolean
  created_at: string
  excerpt: string
  feature_image_caption: string
  feature_image: string
  featured: boolean
  html: string
  id: string
  published_at: string
  reading_time: number
  slug: string
  tags: {
    id: string
    name: string
    slug: string
    description: string
  }[]
  title: string
  updated_at: string
  url: string
  uuid: string
  visibility: string
}

export type BlogPostsApiReply = {
  // thats from the ghost blog api
  posts: BlogPost[]
}

export type ParsedBlogPost = {
  date: string
  id: string
  image: string
  readingTime: number
  slug: string
  title: string
  url: string
}

export type BlogPostsReply = {
  // thats from the internal blog posts api
  news: ParsedBlogPost[]
  learn: ParsedBlogPost[]
}
