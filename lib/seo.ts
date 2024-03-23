export const seo = {
  title: 'Kally Space',
  description:
    '我叫 Kally Yang。',
  url: new URL(
    process.env.NODE_ENV === 'production'
      ? 'https://space.kallyyang.com'
      : 'http://localhost:3000'
  ),
} as const
