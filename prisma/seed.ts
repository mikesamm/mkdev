const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Clear the old seed data
  await prisma.post.deleteMany().then(() => console.log('Deleted all posts'));
  await prisma.user.deleteMany().then(() => console.log('Deleted all users'));
  await prisma.tags.deleteMany().then(() => console.log('Deleted all tags'));

  const tagJavaScript = await prisma.tags.create({
    data: { name: 'Javascript', tagType: 'Post' },
  });
  const tagTypescript = await prisma.tags.create({
    data: { name: 'Typescript', tagType: 'Post' },
  });

  const postTags = await prisma.tags.createMany({ data: [
    { tagType: 'Post', name: 'FullStack' },
    { tagType: 'Post', name: 'Backend' },
    { tagType: 'Post', name: 'Frontend' },
    { tagType: 'Post', name: 'Ui' },
    { tagType: 'Post', name: 'DevOps' },
    { tagType: 'Post', name: 'Beginner' },
    { tagType: 'Post', name: 'Senior' },
    { tagType: 'Post', name: 'Junior' },
    { tagType: 'Post', name: 'Cloud' },
    { tagType: 'Post', name: 'Ai' },
    { tagType: 'Post', name: 'Mobile' },
    { tagType: 'Post', name: 'Games' },
    { tagType: 'Post', name: 'ios' },
]});

const userTags = await prisma.tags.createMany({ 
  data: [
    { tagType: 'User', name: 'Typescript' },
    { tagType: 'User', name: 'Javascript' },
    { tagType: 'User', name: 'Fullstack' },
    { tagType: 'User', name: 'Backend' },
    { tagType: 'User', name: 'Frontend' },
    { tagType: 'User', name: 'Ui' },
    { tagType: 'User', name: 'DevOps' },
    { tagType: 'User', name: 'Beginner' },
    { tagType: 'User', name: 'Senior' },
    { tagType: 'User', name: 'Junior' },
    { tagType: 'User', name: 'Cloud' },
    { tagType: 'User', name: 'Ai' },
    { tagType: 'User', name: 'Mobile' },
    { tagType: 'User', name: 'Games' },
    { tagType: 'User', name: 'ios' },
]})

  const user1 = await prisma.user.create({
    data: {
      name: 'Squidward J.Q. Tentacles',
      username: 'Squidy',
      googleId: '1234567890',
      linkedinId: '1234567810',
      githubId: 'XXXXXXXXXX',
      firstName: 'Squidward',
      lastName: 'Tentacles',
      picture: 'XXXXXXXX',
      follower_count: 10,
      post_count: 2,

      posts: {
        create: [
          { title: 'Interesting day!', body: 'This is the first post.' },
          {
            title: 'Typescript',
            body: 'A love/hate language.',
            tags: {
              connect: {
                id: tagTypescript.id,
              },
            },
          },
        ],
      },
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Patrick Star',
      username: 'Patrick Star',
      googleId: '0987654321',
      linkedinId: '1234567444',
      githubId: 'XXXXXXXX333',
      firstName: 'Patrick',
      lastName: 'Star',
      picture:
        'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      follower_count: 10,
      post_count: 2,
      posts: {
        create: [
          {
            title: 'Messages',
            body: "I'm implementing a messages feature!",
            tags: {
              connect: { id: tagJavaScript.id },
            },
          },
          {
            title: 'Conversations',
            body: 'It can store all conversations from everyone!',
            tags: {
              connect: {
                id: tagTypescript.id,
              },
            },
          },
        ],
      },
    },
  });
  const user3 = await prisma.user.create({
    data: {
      name: 'Sheldon James Plankton',
      username: 'Plankton the Evil Genius',
      googleId: '1XXXXXXXXX',
      linkedinId: '1234567855',
      githubId: 'XXXXXXX666',
      firstName: 'Sheldon James',
      lastName: 'Plankton',
      picture:
        'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      follower_count: 10,
      post_count: 2,

      posts: {
        create: [
          {
            title: 'Searching!',
            body: "User's can search tags or other users!",
            tags: {
              connect: {
                id: tagTypescript.id,
              },
            },
          },
          {
            title: 'Dashboard',
            body: 'Not sure who is doing that yet...',
            tags: {
              connect: {
                id: tagTypescript.id,
              },
            },
          },
        ],
      },
    },
  });

  const user4 = await prisma.user.create({
    data: {
      name: 'Larry The Lobster',
      username: 'Bubble Buddy',
      googleId: 'XXXXXXXXX0',
      linkedinId: '1234569999',
      githubId: 'XXXXXXX664',
      firstName: 'Larry',
      lastName: 'Lobster',
      picture:
        'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      follower_count: 10,
      post_count: 2,

      posts: {
        create: [
          {
            title: 'EZPZ',
            body: "Working on some S3 buckets for user's Demos!",
            tags: {
              connect: {
                id: tagTypescript.id,
              },
            },
          },

          {
            title: 'Scrum',
            body: 'Boooo!',
            tags: {
              connect: {
                id: tagTypescript.id,
              },
            },
          },
        ],
      },
    },
  });

  // console.log({ user1, user2, user3, user4 });
  console.log('Database seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
