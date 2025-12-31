
<image src="https://www.resilienceweb.org.uk/_next/static/media/logo.b5bac6f2.png" height="100" />

Resilience Webs are interactive digital maps of most environmental and social justice related organisations working within and for a place.

Inspiration: [https://www.transitioncambridge.org/thewiki/wiki-uploads/TTEvents.TranNews/megsweb.pdf](https://www.transitioncambridge.org/thewiki/wiki-uploads/TTEvents.TranNews/megsweb.pdf)

Currently online at [https://resilienceweb.org.uk](https://resilienceweb.org.uk)
## Getting started

### Prerequisites

Check these are installed:

- Node.js
  - To select the right runtime check the `.nvmrc` file, alternatively if you have node version manager (nvm) installed simply run the `nvm install` command
- [Docker](https://www.docker.com/)

### Installation

- Clone a local copy of the repository
- Create a `.env` file by copying the `.env.example` file:
```sh
cp .env.example .env
```
- Ask Diner for env var values required for development

- Install the projects dependencies:
```sh
npm install
```
- Build and run a development version of the app:
```sh
npm run dev
```
It will open in your default browser at http://localhost:4000.

### Local database setup

- Ensure you have a valid `.env` file, the example DATABASE_URL environment variable will be used in this process
- Set `RW_TEST_USER_EMAIL` in `.env` to your own email address. This will help the Prisma seed function create a test account for you. The email needs to be valid as authentication works via an OTP code sent to your email.
- To create the local database:
```sh
npm run db:up
```
- To prepare the database with tables:
```sh
npx prisma migrate reset
```
- To view the databases contents:
```sh
npm run db
```

## Usage

See the [knowledge base](https://knowledgebase.resilienceweb.org.uk/) for more information.

Database seeds can be run with:
```sh
npx prisma db seed
```

## Deploying

### To the staging environment

- Follow instructions [here](https://vercel.com/docs/cli) to set up Vercel CLI (you need to have an account in our Vercel team)
- Run `npx vercel deploy -- target staging`


## Contributing

If you'd like to contribute to the project, get in touch at info@resilienceweb.org.uk. We welcome anyone who wants to contribute code, documendation or testing efforts.

If you'd prefer to support the project financially, you can do so at [https://opencollective.com/resilience-web](https://opencollective.com/resilience-web).


## Technical details

I wrote a blog post that goes through technical choices that I made for this project. You can read it here: [https://dinerismail.dev/blog/how-i-built-a-product-that-people-love](https://dinerismail.dev/blog/how-i-built-a-product-that-people-love)


## License

[Attribution 4.0 International](LICENSE.md)


## Acknowledgements

Many thanks to [Gitbook](https://www.gitbook.com) for supporting our project by giving us a membership on their brilliant documentation platform.
