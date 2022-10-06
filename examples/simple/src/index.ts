import { PrismaClient } from '@prisma/client';
import { Logger } from 'tslog';
import { encryptionMiddleware } from 'prisma-encrypter';

const logger = new Logger({ maskValuesOfKeys: [] });
const prisma = new PrismaClient();

prisma.$use(
  encryptionMiddleware({
    global: {
      key: 'dRgUkXn2r5u8x/A?D(G+KbPeShVmYq3s',
    },
    models: [
      {
        model: 'User',
        fields: ['password'],
      },
    ],
  })
);

async function main() {
  // delete all users
  await prisma.user.deleteMany();

  // create a new user, return the encrypted value
  const user = await prisma.user.create({
    data: { name: 'John', password: '123456' },
  });
  logger.info(user);

  // find the user and decrypt
  const foundUser = await prisma.user.findUnique({ where: { id: user.id } });
  logger.info(foundUser);
}

main();
