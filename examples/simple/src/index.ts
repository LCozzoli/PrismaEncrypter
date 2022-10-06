import { PrismaClient } from '@prisma/client';
import { Logger } from 'tslog';
import { encryptionMiddleware } from 'prisma-encrypter';

const logger = new Logger({ maskValuesOfKeys: [], displayFunctionName: false });
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
  logger.debug('user', user);

  // find the user and decrypt
  const foundUser = await prisma.user.findUnique({ where: { id: user.id } });
  logger.debug('foundUser', foundUser);

  // update the user, return the encrypted value
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { password: '7654321' },
  });
  logger.debug('updatedUser', updatedUser);

  // find the user and decrypt
  const newUser = await prisma.user.findUnique({ where: { id: user.id } });
  logger.debug('newUser', newUser);
}
main();
