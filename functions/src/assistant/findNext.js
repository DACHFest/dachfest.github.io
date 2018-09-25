'use strict';
 
import * as admin from 'firebase-admin';
import { Card, V2Agent } from 'dialogflow-fulfillment';

/*
class Session {
    startTime: Date;
    endTime: Date;
    authors: string[];
    title: string;
    description: string;
    venue: string;
    link: string; // link to session on website '/schedule/2018-10-12?sessionId=10000'
}
*/
export const SessionDisplayedBefore = {
    startTime: null,
    endTime: null,
    authors: [],
    title: 'DACHfest hasn\'t started yet!',
    description: 'Checkout the timetable on the website!',
    venue: null,
    link: 'https://dachfest.com'
};

export const SessionDisplayedAfter = {
    startTime: null,
    endTime: null,
    authors: [],
    title: 'DACHfest is over :-((',
    description: 'But there is always a next time!',
    venue: null,
    link: 'https://dachfest.com'
};

export const SessionError = {
    startTime: null,
    endTime: null,
    authors: [],
    title: 'Ups... something went wrong',
    description: 'If this happens more than once, don\'t hesitate to contact us.',
    venue: null,
    link: 'https://dachfest.com'
};

/**
 * searchs for the next sessions from the given time 
 * 
 * @param time the time a user asked for a next session, in production this should be the current time.
 */
export function findNext(datetime) {
    const db = admin.firestore();
    return new Promise((resolve, reject) => {
        db.collection('genSchedule').where('schedule_startTime','>', datetime).orderBy('schedule_startTime').limit(5).get()
        .then(function(querySnapshot) {
            let sessions = [];
            querySnapshot.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots
                sessions.push({
                    startTime: doc.data().schedule_startTime.toDate(),
                    endTime: doc.data().schedule_endTime.toDate(),
                    authors: doc.data().session_authors,   
                    title: doc.data().session_title,
                    description: doc.data().session_description,
                    venue: doc.data().schedule_track,
                    link: doc.data().session_link, 
                });
            });

            // eliminate double entries (Could happen, because every talk is in there for every speaker, 2 speaker, same talk -> 2 entries)
            const reducerMap = new Map();
            sessions.forEach(session => reducerMap.set(session.title, session));
            sessions = Array.from(reducerMap.values());
            
            if (sessions.length === 0) {
                // no session found, the event is done.
                sessions = [SessionDisplayedAfter];
            } else {
                // check if we are far away from the event beeing started (more than 24h)
                if ((new Date(sessions[0].startTime).getTime() - datetime.getTime()) > 24*60*60*1000) {
                    sessions = [SessionDisplayedBefore];
                }
            }

            // reduce the number of sessions returned to 3
            sessions = sessions.slice(0, 3);

            resolve(sessions);
        });
    });
}


export async function findNextIntent(agent) {

    // retrieve the next talk based on the current date and time
    const sessions = await findNext(new Date());

    sessions.forEach((session) => {
        // create authors
        let authors = '';
        session.authors.forEach((author) => {
            authors += `${authors.length>0 ? ' and ': ''}${author}`;
        });

        if (session.startTime && session.endTime && authors) { 
            agent.add(`The next Talk '${session.title}' by ${authors} starts at ${session.startTime} in the ${session.venue}`);
        } 
        agent.add(new Card({
            title: session.title,
            // imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
            text: session.description,
            buttonText: 'Details',
            buttonUrl: session.link
          })
        );
    });
}
