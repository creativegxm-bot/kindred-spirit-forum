export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  community: string;
  communityIcon: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  createdAt: Date;
  imageUrl?: string;
}

export interface Comment {
  id: string;
  content: string;
  author: string;
  upvotes: number;
  downvotes: number;
  createdAt: Date;
  replies?: Comment[];
}

export interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  icon: string;
  banner?: string;
}
