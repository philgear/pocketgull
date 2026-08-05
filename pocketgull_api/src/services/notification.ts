import * as admin from 'firebase-admin';

// Initialize Firebase Admin (requires GOOGLE_APPLICATION_CREDENTIALS or Firebase Service Account in env)
// If not configured, we'll gracefully mock the dispatch.
let isFirebaseInitialized = false;

  try {
    admin.initializeApp();
    isFirebaseInitialized = true;
    console.log('[Notification Service] Firebase Admin initialized.');
  } catch (error: any) {
    const safeErr = String(error?.message || error || '').replace(/[\r\n\u2028\u2029]+/g, ' ').slice(0, 500);
    console.warn('[Notification Service] Firebase Admin not initialized. Push notifications will be mocked. Error:', safeErr);
  }

export async function sendPushNotification(fcmToken: string, title: string, body: string, data?: any) {
  const sanitize = (str: any) => String(str || '').replace(/[^a-zA-Z0-9_\-\.\/\?\&\s]/g, '_').slice(0, 500);
  const cleanTokenLength = Number(fcmToken ? String(fcmToken).length : 0);
  const cleanTokenProvided = fcmToken ? 'true' : 'false';
  if (!isFirebaseInitialized || !fcmToken) {
    console.log('[Notification Service Mock] Sending push notification (tokenProvided=%s, tokenLength=%d):', cleanTokenProvided, cleanTokenLength);
    console.log('  Title: %s', sanitize(title));
    console.log('  Body:  %s', sanitize(body));
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
    const response = await (admin as any).messaging().send(message);
    console.log('[Notification Service] Successfully sent message:', sanitize(response));
  } catch (error: any) {
    console.error('[Notification Service] Error sending push notification:', sanitize(error?.message));
  }
}
