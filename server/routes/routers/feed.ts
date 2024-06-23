import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { PostWithRelations } from '../../../types';

const feed = Router();
const prisma = new PrismaClient();

feed.get('/', async (req: any, res: any):Promise<void> => {
  try{
    let allPosts : PostWithRelations[];
    if (!req.user) {
      allPosts = await prisma.post.findMany(
        {
          include: {
            author: true,
            tags: true,
            liked: {select: {id:true}}
          },
          orderBy: [
            {
              createdAt: 'desc'
            }
          ]
        }
      );
    }
    else {
      const userWithFollowsAndTags = await prisma.user.findUnique(
        {
          where: {id: req.user.id},
          include:{
            tags: {select: {id: true}},
            following: {select: {id: true}},
          },
        }
      );
      const feedFilter = {
        users: [...userWithFollowsAndTags!.following, {id: userWithFollowsAndTags!.id}].flatMap(entry => entry.id),
        tags: [...userWithFollowsAndTags!.tags].flatMap(entry => entry.id),
      }
      if(feedFilter.users.length <= 1 && feedFilter.tags.length === 0 ) {
        allPosts = await prisma.post.findMany(
          {
            include: {
              author: true,
              tags: true,
              liked: {select: {id:true}}
            },
            orderBy: [
              {
                createdAt: 'desc'
              }
            ]
          }
        )
      }
      else{
        allPosts = await prisma.post.findMany(
          {
            where: {
              OR:[
                {
                  author: {
                    id: { in: feedFilter.users }
                  }
                }
              ]
            },
            include: {
              author: true,
              tags: true,
              liked: {select: {id:true}}
            },
            orderBy: [
              {
                createdAt: 'desc'
              }
            ]
          }
        )
      }
      allPosts = allPosts.map(post => (
        {...post, likedByUser: post.liked.slice().map(like => like.id).includes(req.user.id)}
      ))
      allPosts.forEach(post => {console.log(post.id, post.likedByUser)})
    }
    res.send(allPosts);
  }
  catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
  finally {
    await prisma.$disconnect();
  }
})

export default feed;