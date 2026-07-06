import webpush from 'web-push';
import db from '@/lib/db';

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    'mailto:admin@motoserve.web.id',
    vapidPublicKey,
    vapidPrivateKey
  );
}

export async function sendPushNotification(userId: number, title: string, body: string) {
  try {
    const subscriptions = await db.query(
      'SELECT endpoint, keys_p256dh, keys_auth FROM push_subscriptions WHERE user_id = ?',
      [userId]
    ) as any[];

    if (!subscriptions || subscriptions.length === 0) {
      return;
    }

    const payload = JSON.stringify({ title, body });

    const promises = subscriptions.map(sub => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.keys_p256dh,
          auth: sub.keys_auth
        }
      };

      return webpush.sendNotification(pushSubscription, payload)
        .catch(err => {
          // Clean up expired subscriptions
          if (err.statusCode === 410 || err.statusCode === 404) {
            db.query('DELETE FROM push_subscriptions WHERE endpoint = ?', [sub.endpoint]).catch(() => {});
          } else {
            console.error('Push Service error for endpoint:', sub.endpoint, err);
          }
        });
    });

    await Promise.all(promises);
  } catch (error) {
    console.error('sendPushNotification error:', error);
  }
}

export async function checkAndNotifyCriticalComponents(userId: number, motorcycleId: string, currentOdo: number) {
  try {
    // 1. Fetch motorcycle details
    const motorcycles = await db.query(
      'SELECT name FROM motorcycles WHERE id = ? AND user_id = ?',
      [motorcycleId, userId]
    ) as any[];

    if (motorcycles.length === 0) return;
    const motorName = motorcycles[0].name;

    // 2. Fetch intervals
    const intervalRows = await db.query(
      'SELECT component_name, interval_km FROM intervals WHERE motorcycle_id = ?',
      [motorcycleId]
    ) as any[];

    // 3. Fetch last services
    const lastServiceRows = await db.query(
      'SELECT component_name, last_service_km FROM last_services WHERE motorcycle_id = ?',
      [motorcycleId]
    ) as any[];

    const criticalComponents: string[] = [];

    for (const intRow of intervalRows) {
      const comp = intRow.component_name;
      const intervalVal = intRow.interval_km;
      
      const lastRow = lastServiceRows.find(r => r.component_name === comp);
      const lastVal = lastRow ? parseFloat(lastRow.last_service_km) : 0;

      const elapsed = currentOdo - lastVal;
      const lifeLeft = Math.max(0, 1 - (elapsed / intervalVal));

      if (lifeLeft <= 0) {
        criticalComponents.push(comp);
      }
    }

    if (criticalComponents.length > 0) {
      const title = '⚠️ Perhatian: Servis MotoServ!';
      const body = `Komponen motor ${motorName} Anda (${criticalComponents.join(', ')}) sudah melewati batas dan harus diservis!`;
      await sendPushNotification(userId, title, body);
    }

  } catch (err) {
    console.error('checkAndNotifyCriticalComponents error:', err);
  }
}
