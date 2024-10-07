Inspiration: [https://www.transitioncambridge.org/thewiki/wiki-uploads/TTEvents.TranNews/megsweb.pdf](https://www.transitioncambridge.org/thewiki/wiki-uploads/TTEvents.TranNews/megsweb.pdf)

Currently online at [https://resilienceweb.org.uk](https://resilienceweb.org.uk)

## Running the app locally

- Clone the repository locally
- From the root directory of this project
- Duplicate the `.env.example` file, renaming it to `.env`
  - Ask Diner for env var values required for development
- Make sure you have Node.js installed
  - To select the right runtime check the `.nvmrc` file, alternatively if you have node version manager (nvm) installed simply run the `nvm install` command
- Run the `npm install` command to install the projects dependencies
- Run the `npm run dev` command to build and run a development version of the app, it will then open in your default browser at http://localhost:3000

## Local database setup

- Make sure you have a valid `.env` file, the example DATABASE_URL environment variable will be used in this process
- Make sure you have docker installed from https://www.docker.com/
- To create the local database run `npm run db:up`
- To prepare the database with tables run `npx prisma migrate reset`
- Fill out `RW_TEST_USER_EMAIL` in .env with your own email address. This will help the Prisma seed function create a test account for you. The email needs to be valid as authentication works via a magic login email.
- To view the databases contents run `npm run db`

## Contributing

If you'd like to contribute to the project, get in touch at info@resilienceweb.org.uk. We welcome anyone who wants to contribute code, documendation or testing efforts. If you'd prefer to support the project financially, you can do so at [https://opencollective.com/resilience-web](https://opencollective.com/resilience-web).

## Technical details

I wrote a blog post that goes through technical choices that I made for this project. You can read it here: [https://dinerismail.dev/blog/how-i-built-a-product-that-people-love](https://dinerismail.dev/blog/how-i-built-a-product-that-people-love)

## Acknowledgements

[![Powered by Vercel](https://resilienceweb.org.uk/powered-by-vercel.svg)](https://vercel.com?utm_source=resilience-web&utm_campaign=oss)

Many thanks to [Gitbook](https://www.gitbook.com) for supporting our project by giving us a membership on their brilliant documentation platform.
