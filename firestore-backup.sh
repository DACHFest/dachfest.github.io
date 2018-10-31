#!/bin/bash

yarn firestore:copy config firestore/config.json
yarn firestore:copy gallery firestore/gallery.json
yarn firestore:copy notificationsSubscribers firestore/notificationsSubscribers.json
yarn firestore:copy schedule firestore/schedule.json
yarn firestore:copy sessions firestore/sessions.json
yarn firestore:copy speakers firestore/speakers.json
yarn firestore:copy tickets firestore/tickets.json

yarn firestore:copy team firestore/team.json
yarn firestore:copy team/0/members firestore/team-members.json

yarn firestore:copy partners firestore/partners.json
yarn firestore:copy partners/0/items firestore/partners-madepossible.json
yarn firestore:copy partners/1/items firestore/partners-diamond.json
yarn firestore:copy partners/2/items firestore/partners-gold.json
yarn firestore:copy partners/3/items firestore/partners-silver.json
yarn firestore:copy partners/4/items firestore/partners-diversity.json
yarn firestore:copy partners/5/items firestore/partners-supportive.json
yarn firestore:copy partners/6/items firestore/partners-platinum.json
