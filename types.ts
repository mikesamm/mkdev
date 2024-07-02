import { User, Post, Tags, Blog, Repo, File, Messages } from '@prisma/client';
import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: User;
}

export interface UserProfile extends User {
  posts: PostWithRelations[];
  tags: Tags[];
  blogs: Blog[];
  followedBy: User[];
  following: User[];
}

export interface PostWithRelations extends Post {
  author: User;
  tags: Tags[];
  repo?: RepoWithFiles | null;
  liked: { id: number }[];
  likedByUser?: boolean;
}

export interface RepoWithFiles extends Repo {
  files: File[];
}

export interface MessageWithMetadata extends Messages {
  sender: User;
}

export interface BlogPosts {
  devId: User[];
  mediumId: User[];
  id: number;
  title: string;
  url: string;
  cover_image: string;
  description: string;
}
