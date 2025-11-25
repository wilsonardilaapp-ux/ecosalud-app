
'use server';
/**
 * @fileOverview A flow for securely deleting a Firebase user.
 * This flow requires admin privileges and should not be exposed directly to clients.
 *
 * - deleteUser - A function that handles deleting a user from Firebase Authentication.
 * - DeleteUserInput - The input type for the deleteUser function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getAuth } from 'firebase-admin/auth';
import { initializeAdminApp } from '@/firebase/admin';

const DeleteUserInputSchema = z.object({
  uid: z.string().describe('The UID of the user to delete.'),
});
export type DeleteUserInput = z.infer<typeof DeleteUserInputSchema>;

// This is the wrapper function that will be called from other server-side code.
export async function deleteUser(input: DeleteUserInput): Promise<{ success: boolean; message: string }> {
  return deleteUserFlow(input);
}

const deleteUserFlow = ai.defineFlow(
  {
    name: 'deleteUserFlow',
    inputSchema: DeleteUserInputSchema,
    outputSchema: z.object({ success: z.boolean(), message: z.string() }),
  },
  async (input) => {
    try {
      // Initialize the admin app to get privileged access.
      initializeAdminApp();
      
      // Get the admin Auth instance.
      const adminAuth = getAuth();
      
      // Delete the user from Firebase Authentication.
      await adminAuth.deleteUser(input.uid);

      return { success: true, message: `User with UID ${input.uid} deleted successfully.` };

    } catch (error: any) {
      console.error('Error deleting user from Firebase Auth:', error);
      // Make the flow fail with a descriptive message.
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
);
