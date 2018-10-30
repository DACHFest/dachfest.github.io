#!/bin/bash

yarn firestore:copy firestore/config.json config
yarn firestore:copy firestore/gallery.json gallery
yarn firestore:copy firestore/notificationsSubscribers.json notificationsSubscribers
yarn firestore:copy firestore/schedule.json schedule
yarn firestore:copy firestore/sessions.json sessions
yarn firestore:copy firestore/speakers.json speakers
yarn firestore:copy firestore/tickets.json tickets

yarn firestore:copy firestore/team.json team
yarn firestore:copy firestore/team-members.json team/0/members

yarn firestore:copy firestore/partners.json partners
yarn firestore:copy firestore/partners-madepossible.json partners/0/items
yarn firestore:copy firestore/partners-diamond.json partners/1/items
yarn firestore:copy firestore/partners-gold.json partners/2/items
yarn firestore:copy firestore/partners-silver.json partners/3/items
yarn firestore:copy firestore/partners-diversity.json partners/4/items
yarn firestore:copy firestore/partners-supportive.json partners/5/items
