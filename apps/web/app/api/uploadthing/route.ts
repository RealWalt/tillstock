import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

const authMiddleware = async () => { 
  const session = await auth.api.getSession({ headers: await headers() })
  if(!session) throw new Error('Unauthorized')
    return { userId: session.user.id}
 }; //  auth function

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  productImage: f({ image: { maxFileSize: '8MB', maxFileCount: 1 } })
    .middleware(authMiddleware)
    .onUploadComplete(async ({ metadata, file}) => {
      console.log(`Imagen subida por: ${metadata.userId} `)
      return { url: file.ufsUrl}
    })
    // Set permissions and file types for this FileRoute
  
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
