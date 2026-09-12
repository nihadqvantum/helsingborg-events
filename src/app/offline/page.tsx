import Link from 'next/link';

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-[#F7F5F0] px-6 text-center text-[#1A2332]">
      <h1 className="text-xl font-semibold">You&apos;re offline</h1>
      <p className="max-w-sm text-stone-600">
        Cached events and images may still be available. Reconnect to refresh the list.
      </p>
      <Link href="/" className="mt-2 rounded-full bg-[#1A2332] px-4 py-2 text-sm text-white">
        Try again
      </Link>
    </main>
  );
}
