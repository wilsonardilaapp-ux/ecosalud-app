
'use server';
/**
 * @fileOverview A flow for securely uploading media files to Cloudinary.
 *
 * - uploadMedia - A function that handles the media upload process.
 * - UploadMediaInput - The input type for the uploadMedia function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const UploadMediaInputSchema = z.object({
  mediaDataUri: z
    .string()
    .describe(
      "A media file (image or video) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type UploadMediaInput = z.infer<typeof UploadMediaInputSchema>;

const UploadMediaOutputSchema = z.object({
  secure_url: z.string().url(),
});

// This is the wrapper function that will be called from the client.
export async function uploadMedia(input: UploadMediaInput): Promise<{ secure_url: string }> {
  return uploadMediaFlow(input);
}

const uploadMediaFlow = ai.defineFlow(
  {
    name: 'uploadMediaFlow',
    inputSchema: UploadMediaInputSchema,
    outputSchema: UploadMediaOutputSchema,
  },
  async (input) => {
    try {
      const result = await cloudinary.uploader.upload(input.mediaDataUri, {
        resource_type: 'auto', // Automatically detect if it's an image or video
        overwrite: true,
      });

      if (!result.secure_url) {
        throw new Error('Cloudinary did not return a secure URL.');
      }
      
      return {
        secure_url: result.secure_url,
      };

    } catch (error: any) {
      console.error('Error uploading to Cloudinary:', error);
      // Re-throw the error to make the flow fail, which will reject the promise on the client.
      throw new Error(`Failed to upload media: ${error.message}`);
    }
  }
);
