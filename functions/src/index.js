import admin from 'firebase-admin';

import saveUserData from './save-user-data';
import sendGeneralNotification from './notifications';
import scheduleNotifications from './schedule-notifications';
import optimizeImages from './optimize-images';
import mailchimpSubscribe from './mailchimp-subscribe';
import prerender from './prerender';
import recreateGenSchedule from './admin';
import dialogflowFirebaseFulfillment from './assistant/index';

admin.initializeApp();
const settings = {timestampsInSnapshots: true};
admin.firestore().settings(settings);

export {
  saveUserData,
  sendGeneralNotification,
  scheduleNotifications,
  optimizeImages,
  mailchimpSubscribe,
  prerender,
  recreateGenSchedule,
  dialogflowFirebaseFulfillment,
}
