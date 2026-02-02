import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { getCurrentUser } from './auth/server';

const f = createUploadthing();

/**
 * Uploadthing file router for avatar uploads
 */
export const ourFileRouter = {
  avatarUploader: f({
    image: {
      maxFileSize: '2MB',
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const user = await getCurrentUser();

      if (!user) {
        throw new Error('Unauthorized');
      }

      return { userId: user.id, email: user.email };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Avatar upload complete for user:', metadata.email);
      console.log('File URL:', file.ufsUrl);

      // Return the URL to the client
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
