export type BlogPost = {    id: string;
    uuid: string;
    title: string;
    slug: string;
    html: string;
    comment_id: string;
    feature_image: string;
    featured: boolean;
    visibility: string;
    created_at: string;
    updated_at: string;
    published_at: string;
    url: string;
    excerpt: string;
    reading_time: number;
    access: boolean;
    comments: boolean;
    feature_image_caption: string;
}

export type BlogPostsReply = {
    posts: BlogPost[]
}