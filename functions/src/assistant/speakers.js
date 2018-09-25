const { Carousel } = require('actions-on-google');
import * as admin from 'firebase-admin';

export async function speakersIntent(agent) {
    const db = admin.firestore();
    return new Promise((resolve, reject) => {
        db.collection("genSchedule").where('speaker_name', '>', '')
        .get().then((querySnapshot) => {

            // create a map for the speakers first (because speaker names must be unique)
            // Map<string, OptionItem> = <speakerName, {title, description, image {url, accessibilityText}}
            const speakerMap = new Map();
            querySnapshot.forEach((doc) => {
                console.log(doc.data());
                if (!speakerMap.get(doc.data().speaker_name)) {
                    speakerMap.set(doc.data().speaker_name, {
                        title: doc.data().speaker_name,
                        description: doc.data().session_title,
                        image: {
                            url: doc.data().speaker_photoUrl,
                            accessibilityText: doc.data().speaker_name,
                        }
                    });
                }
            });

            let conv = agent.conv(); // Get Actions on Google library conversation object
            conv.ask('Our speakers are:'); // Use Actions on Google library to add responses
            
            let carousel = { title: 'Our Speakers', items: {} };
            Array.from(speakerMap.values())
                .slice(0,10)  // only 10 entries allowed in carousel
                .forEach(entry => carousel.items[entry.title] = entry); 

            conv.ask(new Carousel(carousel));
            agent.add(conv);

            resolve();
        }).catch((error) => {
            reject(error);
        });
    });
}