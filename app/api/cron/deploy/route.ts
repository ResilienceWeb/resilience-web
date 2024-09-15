export async function GET() {
  if (!process.env.DEPLOY_URL) {
    throw new Error(
      'You must define MONDAY_DEPLOY_URL env variable for this cron.',
    )
  }
  return await fetch(process.env.DEPLOY_URL)
}
