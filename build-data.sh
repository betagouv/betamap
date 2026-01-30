#!/bin/sh

set -e
set -x

node scripts/build-flare-fabriques.js > src/fabriques.json
node scripts/build-flare-thematiques.js > src/thematiques.json
node scripts/build-flare-technos.js > src/technos.json
node scripts/build-flare-competences.js > src/competences.json
node scripts/build-flare-sponsors.js > src/sponsors.json
node scripts/build-flare-coaches.js > src/coaches.json
node scripts/build-flare-apigouv-themes.js > src/apigouv-themes.json
node scripts/build-flare-apigouv-producteurs.js > src/apigouv-producteurs.json
node scripts/build-flare-codegouv.js > src/codegouv-dependencies.json
node scripts/build-flare-gouvmap.js > src/gouvmap.json