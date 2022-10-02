# Prisma Encryption

This package allow you to encrypt your models in Prisma

## Installation

Install the package using npm

```bash
  npm install prisma-encrypter
```

## Usage/Examples

If you use **ivField** on a model, don't forget to include this field in your select/update queries.
key argument must be a **32-bits** key
iv argument must be a **16-bits** key

### Basic usage

```javascript
import { PrismaClient } from '@prisma/client';
import { encryptionMiddleware } from 'prisma-encrypter';

const prisma = new PrismaClient();

prisma.$use(
  encryptionMiddleware({
    global: {
      key: 'Xp2r5u8x/A?DcG+KbPeShVmYq3t6v9y$',
    },
    models: [
      {
        model: 'User',
        fields: ['password'],
      },
    ],
  })
);
```

### Advanced usage

```javascript
import { PrismaClient } from '@prisma/client';
import { encryptionMiddleware, encryptModels } from 'prisma-encrypter';

const prisma = new PrismaClient();
prisma.$use(
  encryptionMiddleware({
    global: {
      iv: 'C*F-J@NcRfUjXn2r',
      algorithm: 'aes-256-cbc',
    },
    models: [
      {
        model: 'User',
        fields: ['password', 'secret'],
        local: {
          key: '2p2r5u8x/A?DcG+KbPeShVmYq3t6v9y1',
          ivField: 'hash',
          stripIvField: true,
        },
      },
    ],
  })
);

// In another file, you can add more models (or one using encryptModel).
encryptModels([
  {
    model: 'Vault',
    local: {
      key: 'NcRfUjXn2r5u8x!A%D*G-KaPdSgVkYp3',
      iv: 'Zq4t7w!z%C*F-J@N',
      algorithm: 'aes-256-gcm',
    },
  },
  {
    model: 'Entries',
    fields: ['code'],
    local: {
      key: 'w9z$C&F)J@NcRfUjXn2r5u7x!A%D*G-K',
    },
  },
]);

//
```

The lib also exposes manualEncrypt() and manualDecrypt()
