var admin = require('firebase-admin');

// the service account is not in github, ask @mpoehler if you need it
var serviceAccount = require('../hummingbird-test-41647-firebase-adminsdk-ndu0v-ee1d3929fe.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://hummingbird-test-41647.firebaseio.com'
});

const settings = {timestampsInSnapshots: true};
admin.firestore().settings(settings);

var assert = require('assert');

/*
const adminFunctions = require('../dist/admin.js');
describe('admin', () => {
    console.log('huhu');
    adminFunctions.recreateIndexTable();
});
*/

const findNextFunctions = require('../dist/assistant/findNext.js');
describe('findNext', () => {

    // =================================
    // edge cases first
    // =================================
    it('should return an info card that informs when the DACHfest starts if this is called at a date before the DACHfest', () => {
        return findNextFunctions.findNext(new Date('1999-12-17T03:24:00Z')).then((session) => {
            assert.equal(session[0].title, findNextFunctions.SessionDisplayedBefore.title, 'The SessionDisplayedBefore entry was expected');    
        });
    });

    it('should return an info card that informs that the DACHfest is over', () => {
        return findNextFunctions.findNext(new Date('2025-12-17T03:24:00Z')).then ((session) => {
            assert.equal(session[0].title, findNextFunctions.SessionDisplayedAfter.title, 'The SessionDisplayedAfter entry was expected');
        });
    });

    // =================================
    // try right before the Event
    // =================================
    it('should return the first entry (Registration + Coffee)', () => {
        return findNextFunctions.findNext(new Date('2016-09-09T08:00:00')).then ((session) => {
            assert.equal(session[0].title, 'Registration & morning Coffee');
        });
    });


    // =================================
    // try right before the Event
    // =================================
    it('during the day, 13:30', () => {
        return findNextFunctions.findNext(new Date('2016-09-09T11:59:00Z')).then ((sessions) => {
            for (let i=0; i<3; i++) {
                if (sessions[i].title !== 'Windows and .NET on Google Cloud Platform ' &&
                sessions[i].title !== 'Introduction to Progressive Web Apps in Angular 2' &&
                sessions[i].title !== 'Kotlin + Android') {
                    assert.fail('Unexpected Session name: ' + sesssions[i].title);
                }
            }
        });
    });

});

