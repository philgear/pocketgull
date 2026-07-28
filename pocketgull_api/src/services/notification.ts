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
  const sanitize = (str: any) => String(str || '').replace(/[\r\n\u2028\u2029]+/g, ' ').replace(/[\x00-\x1F\x7F]+/g, ' ').slice(0, 500);
  if (!isFirebaseInitialized || !fcmToken) {
    const tokenProvided = Boolean(fcmToken);
    const tokenLength = tokenProvided ? String(fcmToken).length : 0;
    console.log(`[Notification Service Mock] Sending push notification (tokenProvided=${tokenProvided}, tokenLength=${tokenLength}):`);
    console.log(`  Title: ${sanitize(title)}`);
    console.log(`  Body:  ${sanitize(body)}`);
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
