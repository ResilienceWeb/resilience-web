Inspiration: [https://www.transitioncambridge.org/thewiki/wiki-uploads/TTEvents.TranNews/megsweb.pdf](https://www.transitioncambridge.org/thewiki/wiki-uploads/TTEvents.TranNews/megsweb.pdf)

Currently online at [https://resilienceweb.org.uk](https://resilienceweb.org.uk)

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
- To create the local database run `npm run db:up`
- To prepare the database with tables run `npx prisma migrate dev`
- To seed the database with some initial data run `npx prisma db seed`
- To view the databases contents run `npm run db`
- Once you are done with the database you can run the `npm run db:down` command to shut it down, and don't worry your data will be saved for next time!

## Deploying updates

- The graph is hosted at Vercel, which is linked to this repository
- Any changes to the data or the code will trigger a rebuild on Vercel, which then deploys the updates automatically

## Technical details

- Using NextJS, a React framework - https://nextjs.org/
- Dependencies of this project are listed in package.json, and I will update them at a regular interval
- For the network visualisation, I used react-graph-vis which is a wrapper around [vis.js](https://visjs.org/)

## Acknowledgements

[![Powered by Vercel](https://resilienceweb.org.uk/powered-by-vercel.svg)](https://vercel.com?utm_source=resilience-web&utm_campaign=oss)

Many thanks to [Gitbook](https://www.gitbook.com) for supporting our project by giving us a membership on their brilliant documentation platform.
