Inspiration: [https://www.transitioncambridge.org/thewiki/wiki-uploads/TTEvents.TranNews/megsweb.pdf](https://www.transitioncambridge.org/thewiki/wiki-uploads/TTEvents.TranNews/megsweb.pdf)

Currently online at [https://resilienceweb.org.uk](https://resilienceweb.org.uk)

<a href="https://www.buymeacoffee.com/diner" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

## Running the app locally

- Clone the repository locally
- From the root directory of this project
- Duplicate the `.env.example` file, renaming it to `.env`
- Make sure you have Node.js installed from https://nodejs.org
  - To select the right runtime check the `.nvmrc` file, alternatively if you have node version manager (nvm) installed simply run the `nvm install` command
- Run the `npm install` command to install the projects dependencies
- Run the `npm run dev` command to build and run a development version of the app, it will then open in your default browser at http://localhost:3000

## Local database setup

- Make sure you have a valid `.env` file, the example DATABASE_URL environment variable will be used in this process
- Make sure you have docker installed from https://www.docker.com/
- To create the local database run the `npm run db:up` command
- To populate it run the `npx prisma migrate dev` command
- To view the databases contents run the `npm run db` command

## Deploying updates

- The graph is hosted at Vercel, which is linked to this repository
- Any changes to the data or the code will trigger a rebuild on Vercel, which then deploys the updates automatically

## Technical details

- Using NextJS, a React framework - https://nextjs.org/
- Dependencies of this project are listed in package.json, and I will update them at a regular interval
- For the network visualisation, I used react-graph-vis which is a wrapper around [vis.js](https://visjs.org/)

[![Powered by Vercel](https://resilienceweb.org.uk/powered-by-vercel.svg)](https://vercel.com?utm_source=resilience-web&utm_campaign=oss)

