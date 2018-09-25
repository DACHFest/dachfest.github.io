import * as functions from 'firebase-functions';
import { WebhookClient } from 'dialogflow-fulfillment';
import { findNextIntent } from './findNext';

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

const dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
    const webhookClient = new WebhookClient({ request, response });
    // <string, V2Agent>
    const intentMap = new Map();

    // register all intends here
    intentMap.set('Next Talk', findNextIntent);
    webhookClient.handleRequest(intentMap);
  });

export default dialogflowFirebaseFulfillment;