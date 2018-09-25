import admin from 'firebase-admin';
import * as functions from 'firebase-functions';

/*
interface Speaker {
    id: string,
    bio: string,
    company: string,
    companyLogo: string,
    companyLogoUrl: string,
    country: string,
    name: string,
    photo: string,
    photoUrl: string,
    shortBio: string,
    title: string
}

interface Session {
    id: string;
    complexity: string,
    description: string,
    language: string,
    presentation: string,
    speakers: string[],
    tags: string[],
    title: string
}

interface Schedule {
    date: string,
    date_Readable: string,
    startTime: string, 
    endTime: string,
    track: string,
    authors: string[],
}

interface GeneratedSchedule {
    speaker_id: string,
    speaker_bio: string,
    speaker_company: string,
    speaker_companyLogo: string,
    speaker_companyLogoUrl: string,
    speaker_country: string,
    speaker_name: string,
    speaker_photo: string,
    speaker_photoUrl: string,
    speaker_shortBio: string,
    speaker_title: string,

    session_complexity: string,
    session_description: string,
    session_language: string,
    session_presentation: string,
    session_tags: string[],
    session_title: string,
    session_link: string,
    session_authors: string[],

    schedule_startTime: Date, 
    schedule_endTime: Date,
    schedule_track: string,
}
*/

// function createGeneratedSchedule(session: Session, speaker: Speaker, schedule: Schedule): GeneratedSchedule {
function createGeneratedSchedule(session, speaker, schedule) {
 return {
    speaker_id: speaker ? speaker.id : null,
    speaker_bio: speaker ? speaker.bio : null,
    speaker_company: speaker ? speaker.company : null,
    speaker_companyLogo: speaker ? speaker.companyLogo : null,
    speaker_companyLogoUrl: speaker ? speaker.companyLogoUrl : null,
    speaker_country: speaker ? speaker.country : null,
    speaker_name: speaker ? speaker.name : null,
    speaker_photo: speaker ? speaker.photo : null,
    speaker_photoUrl: speaker ? speaker.photoUrl : null,
    speaker_shortBio: speaker ? speaker.shortBio : null,
    speaker_title: speaker ? speaker.title : null,

    session_complexity: session.complexity ? session.complexity : null,
    session_description: session.description,
    session_language: session.language ? session.language : null,
    session_presentation: session.presentation ? session.presentation : null,
    session_tags: session.tags ? session.tags : null,
    session_title: session.title,
    session_authors: schedule.authors,
    session_link: `/schedule/${schedule.date}?sessionId=${session.id}`,

    schedule_startTime: new Date(`${schedule.date}T${schedule.startTime}:00`), 
    schedule_endTime: new Date(`${schedule.date}T${schedule.startTime}:00`),

    schedule_track: schedule.track,
 }
}

/**
 * taken from https://firebase.google.com/docs/firestore/manage-data/delete-data
 * 
 * Deletes a collection in firestore
 * 
 * @param collectionPath 
 * @param batchSize 
 */
function deleteCollection(collectionPath, batchSize) {
    const db = admin.firestore();
    const query = db.collection(collectionPath).orderBy('__name__').limit(batchSize);
    return new Promise((resolve, reject) => {
      deleteQueryBatch(query, batchSize, resolve, reject);
    });
}

/**
 * taken from https://firebase.google.com/docs/firestore/manage-data/delete-data
 * 
 * Deletes a collection in firestore
 */
function deleteQueryBatch(query, batchSize, resolve, reject) {
    const db = admin.firestore();
    query.get()
        .then((snapshot) => {
            // When there are no documents left, we are done
            if (snapshot.size === 0) {
                return 0;
            }

            // Delete documents in a batch
            const batch = db.batch();
            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });

            return batch.commit().then(() => {
                return snapshot.size;
            });
        }).then((numDeleted) => {
            if (numDeleted === 0) {
                resolve();
                return;
            }

            // Recurse on the next process tick, to avoid
            // exploding the stack.
            process.nextTick(() => {
                deleteQueryBatch(query, batchSize, resolve, reject);
            });
        })
        .catch(reject);
}

/**
 * This creates a additional datastructure from the hoverboard data, that can be queried more easily.
 * 
 * export needed to use it in test.
 */
export async function recreateIndexTable() {
    
    const db = admin.firestore();

    // remove existing entries
    deleteCollection('/genSchedule', 100).then().catch();

    // first build up all the data into the memory
    const speakers = new Map();
    const sessions = new Map();

    await Promise.all([
        // speakers
        db.collection('speakers').get().then((snapshot) => {
            snapshot.forEach((speaker) => {
                speakers.set(speaker.id, {
                    id: speaker.id,
                    bio: speaker.data().bio,
                    company: speaker.data().company,
                    companyLogo: speaker.data().companyLogo,
                    companyLogoUrl: speaker.data().companyLogoUrl,
                    country: speaker.data().country,
                    name: speaker.data().name,
                    photo: speaker.data().photo,
                    photoUrl: speaker.data().photoUrl,
                    shortBio: speaker.data().shortBio,
                    title: speaker.data().title
                })
            });
        }),
        // sessions
        db.collection('sessions').get().then((snapshot) => {
            snapshot.forEach((session) => {
                sessions.set(session.id, {
                    id: session.id,
                    complexity: session.data().complexity,
                    description: session.data().description,
                    language: session.data().language,
                    presentation: session.data().presentation,
                    speakers: session.data().speakers,
                    tags: session.data().tags,
                    title: session.data().title
                });
            });
        }),
    ]);
    
    // now walk thru the schedule and create one entry for every in the schedule
    const generatedSchedule = [];
    await db.collection('schedule').get().then((snapshot) => {
        snapshot.forEach((dayEntry) => {
            const date = dayEntry.data().date;
            const dateReadable = dayEntry.data().dateReadable;
            const tracks = dayEntry.data().tracks;
            
            // now iterate thru the timeslots for that day
            dayEntry.data().timeslots.forEach((timeslot) => {
                timeslot.sessions.forEach((session, trackindex) => {
                    session.items.forEach((item) => {
                        const s = sessions.get(`${item}`);
                        if (s.speakers) {
                            // there are speakers, create one entry for each speaker

                            // first create the speakers full name array
                            const authors = [];
                            s.speakers.forEach((sp) => {
                                const spe = speakers.get(sp);
                                if (spe) {
                                    authors.push(spe.name);    
                                }
                            });

                            // now create one entry for each speaker
                            s.speakers.forEach((sp) => {
                                const spe = speakers.get(sp);
                                generatedSchedule.push(createGeneratedSchedule(s, spe, {
                                    date: date,
                                    date_Readable: dateReadable,
                                    startTime: timeslot.startTime, 
                                    endTime: timeslot.endTime,
                                    track: tracks[trackindex].title,
                                    authors: authors,
                                }));
                            });
                        } else {
                            // there are no speakers, create one entry
                            generatedSchedule.push(createGeneratedSchedule(s, null, {
                                date: date,
                                date_Readable: dateReadable,
                                startTime: timeslot.startTime, 
                                endTime: timeslot.endTime,
                                track: tracks[trackindex],
                                authors: [],
                            }));
                        }
                    });
                });
            });

        });
    });

    // now store the resulting structure in db
    const genScheduleRef = db.collection('genSchedule');
    generatedSchedule.forEach((gen) => {
        genScheduleRef.add(gen).then().catch();
    });
 }

// explict call to recreateGenSchedule

const recreateGenSchedule = functions.https.onRequest((request, response) => {
    console.log('recreating genSchedule...');
    recreateIndexTable().then(() => {
      console.log('recreate genSchedule done.');
    }).catch((error) => {
      console.error(error);
    });
  });

export default recreateGenSchedule;

// TODO add database trigger