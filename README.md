Inspiration: [https://www.transitioncambridge.org/thewiki/wiki-uploads/TTEvents.TranNews/megsweb.pdf](https://www.transitioncambridge.org/thewiki/wiki-uploads/TTEvents.TranNews/megsweb.pdf)

Currently online at [https://resilienceweb.org.uk](https://resilienceweb.org.uk)

## Running the app locally
* Make sure you have Node.js installed from https://nodejs.org
* Once you clone the repo locally, run `npm install` from the command line in the root directory of this project
* Run `npm run dev` and the app will open in your default browser at http://localhost:3000

## Deploying updates
* The graph is hosted at Vercel, which is linked to this repository
* Any changes to the data or the code will trigger a rebuild on Vercel, which then deployes the updates automatically

## Technical details
* Using NextJS, a React framework - https://nextjs.org/
* Dependencies of this project are listed in package.json, and I will update them at a regular interval
* For the network visualisation, I used react-graph-vis which is a wrapper around [vis.js](https://visjs.org/)

[![Powered by Vercel](https://resilienceweb.org.uk/powered-by-vercel.svg)](https://vercel.com?utm_source=resilience-web&utm_campaign=oss)
