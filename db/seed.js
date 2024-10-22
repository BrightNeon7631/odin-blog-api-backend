const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const defaultPostText =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.';

async function main() {
  const admin = await prisma.user.create({
    data: {
      name: 'John',
      email: 'admin@test.com',
      password: '$2a$10$T4yTyByNyUkn8t8EXJGPfO0.YvLqmCrBDzYtf6o867XqNG48i9jl6', // 123456
      isAdmin: true,
      posts: {
        create: [
          {
            title: 'Kotoku-in, Kamakura',
            text: defaultPostText,
            isPublished: true,
            imageUrl:
              'https://images.unsplash.com/photo-1519185939676-2605343f3d4d?w=1920',
          },
          {
            title: 'Empire State Building, New York',
            text: defaultPostText,
            isPublished: true,
            imageUrl:
              'https://images.unsplash.com/photo-1555109307-f7d9da25c244?w=1920',
          },
          {
            title: 'Cherry Blossom',
            text: defaultPostText,
            isPublished: true,
            imageUrl:
              'https://images.unsplash.com/photo-1645791896285-414148c164e2?w=1920',
          },
          {
            title: 'Torii gate at Meiji-jingu Shrine',
            text: defaultPostText,
            isPublished: true,
            imageUrl:
              'https://images.unsplash.com/photo-1549124151-844d2a02fe9a?w=1920',
          },
          {
            title: 'Rainbow Bridge in Odaiba, Tokyo',
            text: defaultPostText,
            isPublished: true,
            imageUrl:
              'https://images.unsplash.com/photo-1619348813188-64a65c153485?w=1920',
          },
          {
            title: 'Tokyo Skytree at night',
            text: defaultPostText,
            isPublished: true,
            imageUrl:
              'https://images.unsplash.com/photo-1667628324141-eaee7bf935f9?w=1920',
          },
          {
            title: 'Tokyo Tower at night',
            text: defaultPostText,
            isPublished: true,
            imageUrl:
              'https://images.unsplash.com/photo-1606044466411-207a9a49711f?w=1920',
          },
          {
            title: 'Bamboo tree forest in Kyoto',
            text: defaultPostText,
            isPublished: true,
            imageUrl:
              'https://images.unsplash.com/photo-1511364033374-07ffa0c99c4c?w=1920',
          },
          {
            title: 'Fushimi Inari Shrine, Kyoto',
            text: defaultPostText,
            isPublished: true,
            imageUrl:
              'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=1920',
          },
          {
            title: 'Senso-ji Temple, Tokyo',
            text: defaultPostText,
            isPublished: true,
            imageUrl:
              'https://images.unsplash.com/photo-1557409362-e053f9b32b14?w=1920',
          },
          {
            title: 'Kinkakuji temple in Kyoto',
            text: defaultPostText,
            isPublished: true,
            imageUrl:
              'https://images.unsplash.com/photo-1503640538573-148065ba4904?w=1920',
          },
          {
            title: 'Churito Pagoda near Mt. Fuji',
            text: `${defaultPostText} ${defaultPostText}`,
            isPublished: true,
            imageUrl:
              'https://images.unsplash.com/photo-1571755119593-5d9f0f79dc0e?w=1920',
          },
          {
            title: 'Test',
            text: 'test',
            isPublished: false,
            imageUrl: '',
          },
        ],
      },
    },
  });

  const user = await prisma.user.create({
    data: {
      name: 'Tom',
      email: 'tom@test.com',
      password: '$2a$10$T4yTyByNyUkn8t8EXJGPfO0.YvLqmCrBDzYtf6o867XqNG48i9jl6', // 123456
      isAdmin: false,
    },
  });

  const userComments = await prisma.comment.createMany({
    data: [
      {
        text: 'Lorem ipsum dolor sit amet',
        postId: 12,
        authorId: 1,
      },
      {
        text: 'consectetur adipiscing elit',
        postId: 12,
        authorId: 1,
      },
      {
        text: 'sed do eiusmod tempor incididunt ut labore et dolore magna',
        postId: 12,
        authorId: 1,
      },
      {
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.',
        postId: 12,
        authorId: 2,
      },
      {
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.',
        postId: 12,
        authorId: 2,
      },
      {
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.',
        postId: 12,
        authorId: 2,
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
