import * as admin from 'firebase-admin';

// Initialize Firebase Admin (requires GOOGLE_APPLICATION_CREDENTIALS or Firebase Service Account in env)
// If not configured, we'll gracefully mock the dispatch.
let isFirebaseInitialized = false;

try {
  admin.initializeApp();
  isFirebaseInitialized = true;
  console.log('[Notification Service] Firebase Admin initialized.');
} catch (error: any) {
  console.warn('[Notification Service] Firebase Admin not initialized. Push notifications will be mocked. Error:', error.message);
}

export async function sendPushNotification(fcmToken: string, title: string, body: string, data?: any) {
  if (!isFirebaseInitialized || !fcmToken) {
    console.log(`[Notification Service Mock] Sending push notification to ${fcmToken || 'UNKNOWN'}:`);
    console.log(`  Title: ${title}`);
    console.log(`  Body:  ${body}`);
    return;
  }

  const message = {
    notification: {
      title,
      body,
    },
    data: data || {},
    token: fcmToken,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('[Notification Service] Successfully sent message:', response);
  } catch (error: any) {
    console.error('[Notification Service] Error sending push notification:', error.message);
  }
}
