import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'to-do-s3-bucket-admin-amplify',
  access: (allow) => ({
    'public/*': [
      allow.authenticated.to(['get', 'list', 'write', 'delete']),
    ],
  }),
});



