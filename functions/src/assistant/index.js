import * as functions from 'firebase-functions';
import { WebhookClient } from 'dialogflow-fulfillment';

import { findNextIntent } from './findNext';
import { speakersIntent } from './speakers';

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

const dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
    const webhookClient = new WebhookClient({ request, response });
    // <string, V2Agent>
    const intentMap = new Map();

    // register all intends here
    intentMap.set('Next Talk', findNextIntent);

    // these intents are AoG specific
    if (webhookClient.requestSource === webhookClient.ACTIONS_ON_GOOGLE) {
      // intentMap.set('speakers', speakersIntent);  // uses caroussel -> AoG specific
      intentMap.set('speakers2', speakersIntent);  // uses caroussel -> AoG specific
    } 
    webhookClient.handleRequest(intentMap);
  });

export default dialogflowFirebaseFulfillment;