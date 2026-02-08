import { createLogger } from "../logger";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendUploadNotification, type UploadDetails } from "./emailService";

const logger = createLogger({ module: "service", service: "upload" });

/**
 * Notify user when a file is uploaded to their shortcode
 * TODO: This will be called by POST /upload/:shortcode endpoint when implemented
 *
 * @param userId User ID who owns the shortcode
 * @param uploadDetails Details about the uploaded file
 * @returns Promise resolving to success status
 */
export async function notifyUploadReceived(
  userId: string,
  uploadDetails: UploadDetails
): Promise<boolean> {
  try {
    logger.debug({ userId, fileName: uploadDetails.fileName }, "Preparing upload notification");

    // Get user email from database
    const rows = await db
      .select({ email: user.email })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!rows[0]?.email) {
      logger.error({ userId }, "Failed to get user email for upload notification");
      return false;
    }

    const userEmail = rows[0].email;

    // Send upload notification email (non-blocking)
    const success = await sendUploadNotification(userEmail, uploadDetails);

    if (success) {
      logger.info({ userId, userEmail, fileName: uploadDetails.fileName }, "Upload notification sent");
    } else {
      logger.warn({ userId, fileName: uploadDetails.fileName }, "Failed to send upload notification");
    }

    return success;
  } catch (error) {
    logger.error({ error, userId, fileName: uploadDetails.fileName }, "Error notifying upload");
    return false;
  }
}

/**
 * Example usage when upload endpoint is implemented:
 *
 * // In POST /upload/:shortcode handler:
 * import { notifyUploadReceived } from '@/lib/services/uploadService';
 *
 * // After successful file upload
 * await notifyUploadReceived(userId, {
 *   fileName: file.name,
 *   fileSize: file.size,
 *   shortcode: shortcode,
 *   uploaderInfo: uploaderName || uploaderEmail,
 *   timestamp: new Date(),
 * });
 */
