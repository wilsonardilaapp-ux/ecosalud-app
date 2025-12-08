
'use server';
/**
 * @fileOverview A flow for securely uploading media files to Cloudinary.
 *
 * - uploadMedia - A function that handles the media upload process.
 * - UploadMediaInput - The input type for the uploadMedia function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { v2 as cloudinary } from 'cloudinary';

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
    const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
    const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;

    const isCloudinaryConfigured = cloudinaryCloudName && cloudinaryApiKey && cloudinaryApiSecret;

    if (!isCloudinaryConfigured) {
      console.error('Cloudinary configuration is missing. Please check environment variables in your production environment (e.g., Vercel).');
      throw new Error(
        'La configuración del servicio de subida de archivos (Cloudinary) está incompleta en el servidor. Faltan las variables de entorno necesarias.'
      );
    }
    
    cloudinary.config({
      cloud_name: cloudinaryCloudName,
      api_key: cloudinaryApiKey,
      api_secret: cloudinaryApiSecret,
      secure: true,
    });

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
