import styles from '../auth.module.css'

export default function VerifyRequest() {
  return (
    <div className={styles.root}>
      <div className="flex h-screen flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center rounded-xl bg-white p-12">
          <h1 className="mb-4 text-2xl font-bold">Check your email</h1>
          <p>A sign in link has been sent to your email address.</p>
        </div>
      </div>
    </div>
  )
}
