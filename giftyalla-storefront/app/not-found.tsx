import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="section">
      <div className="container container--narrow empty">
        <div className="empty__emoji">🎁</div>
        <h1>Oops, this gift got lost</h1>
        <p>The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link className="btn btn--primary" href="/">Back to home</Link>
      </div>
    </section>
  )
}
