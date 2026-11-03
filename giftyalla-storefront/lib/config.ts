// Everything you'd normally edit in the theme settings lives here.
export const SITE = {
  name: 'Gift Yalla',
  tagline: 'Yalla, make their day.',
  description: 'Same-day flowers, cakes and gifts. Pick your city, day and time window.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  whatsapp: '+966500000000'
}

export const DELIVERY = {
  cities: ['Riyadh', 'Jeddah', 'Dammam', 'Al Khobar', 'Mecca', 'Madinah', 'Jubail', 'Dhahran', 'Qatif'],
  // 24h "start-end". A slot closes `cutoffHours` before it starts.
  slots: [
    { start: '09:00', end: '12:00' },
    { start: '12:00', end: '15:00' },
    { start: '15:00', end: '18:00' },
    { start: '18:00', end: '21:00' }
  ],
  cutoffHours: 2,
  daysAhead: 14,
  tzOffsetHours: 3, // Saudi Arabia = UTC+3
  blackoutDates: [] as string[] // 'YYYY-MM-DD'
}

export type NavItem = { title: string; href: string; children?: { title: string; href: string }[] }
const c = (h: string) => `/collections/${h}`
export const NAV: NavItem[] = [
  { title: 'Birthday', href: c('birthday') },
  { title: 'Gift Sets', href: c('gift-sets') },
  { title: 'Flowers', href: c('flowers') },
  { title: 'Cakes', href: c('cakes') },
  { title: 'Chocolates', href: c('chocolates') },
  { title: 'Perfumes', href: c('perfumes') },
  {
    title: 'Occasions',
    href: '/collections',
    children: [
      { title: 'Anniversary', href: c('anniversary') },
      { title: 'Love', href: c('love') },
      { title: 'Graduation', href: c('graduation') },
      { title: 'New Born', href: c('new-born') },
      { title: 'Get Well Soon', href: c('get-well-soon') },
      { title: 'Wedding', href: c('wedding') }
    ]
  },
  {
    title: 'Gifts for',
    href: '/collections',
    children: [
      { title: 'Her', href: c('gifts-for-her') },
      { title: 'Him', href: c('gifts-for-him') },
      { title: 'Personalised', href: c('personalised') }
    ]
  }
]
