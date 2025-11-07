
'use server';
/**
 * @fileOverview A flow for rating a product.
 *
 * - rateProduct - A function that handles updating a product's rating.
 * - RateProductInput - The input type for the rateProduct function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { doc, runTransaction, getFirestore } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import type { Product } from '@/models/product';


export const RateProductInputSchema = z.object({
  businessId: z.string().describe('The ID of the business that owns the product.'),
  productId: z.string().describe('The ID of the product to rate.'),
  rating: z.number().min(1).max(5).describe('The rating value from 1 to 5.'),
});
export type RateProductInput = z.infer<typeof RateProductInputSchema>;

// This is the wrapper function that will be called from the client.
export async function rateProduct(input: RateProductInput): Promise<{ success: boolean; message: string }> {
  return rateProductFlow(input);
}

const rateProductFlow = ai.defineFlow(
  {
    name: 'rateProductFlow',
    inputSchema: RateProductInputSchema,
    outputSchema: z.object({ success: z.boolean(), message: z.string() }),
  },
  async (input) => {
    // Genkit flows run in a server environment, so we need to initialize
    // a server-side firestore client.
    const { firestore } = initializeFirebase();

    const productRef = doc(firestore, 'businesses', input.businessId, 'products', input.productId);
    
    try {
      await runTransaction(firestore, async (transaction) => {
        const productDoc = await transaction.get(productRef);
        if (!productDoc.exists()) {
          throw new Error("Product not found!");
        }

        const productData = productDoc.data() as Product;
        const currentRating = productData.rating || 0;
        const currentRatingCount = productData.ratingCount || 0;

        const newRatingCount = currentRatingCount + 1;
        const newTotalRating = (currentRating * currentRatingCount) + input.rating;
        const newAverage = newTotalRating / newRatingCount;

        transaction.update(productRef, {
          rating: newAverage,
          ratingCount: newRatingCount,
        });
      });

      return { success: true, message: 'Rating updated successfully.' };
    } catch (e: any) {
      console.error("Transaction failed: ", e);
      return { success: false, message: e.message || 'Failed to update rating.' };
    }
  }
);

    