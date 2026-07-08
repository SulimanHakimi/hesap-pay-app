import SulimanHakimiClient from './SulimanHakimiClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'sheen payment',
  description: 'sheen payment gateway for sheen clients and sheen employees',
  openGraph: {
    title: 'sheen payment',
    description: 'sheen payment gateway for sheen clients and sheen employees',
    images: [
      {
        url: 'https://agency.sheen.af/logo.png',
        width: 800,
        height: 800,
        alt: 'Sheen Payment Logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'sheen payment',
    description: 'sheen payment gateway for sheen clients and sheen employees',
    images: ['https://agency.sheen.af/logo.png'],
  },
};

export default function Page() {
  return <SulimanHakimiClient />;
}
