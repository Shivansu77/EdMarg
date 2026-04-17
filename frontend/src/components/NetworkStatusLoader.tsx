'use client';

import dynamic from 'next/dynamic';

const NetworkStatus = dynamic(
  () => import('./NetworkStatus').then((module) => module.NetworkStatus),
  { ssr: false }
);

export function NetworkStatusLoader() {
  return <NetworkStatus />;
}
