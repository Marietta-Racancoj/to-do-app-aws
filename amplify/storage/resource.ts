import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: "to-do-s3-bucket-admin-amplify",
  access: (allow) => ({
    // Authenticated users can read & write
    'photos/*': [allow.authenticated.to(['read', 'write','delete'])],
  }),
});

