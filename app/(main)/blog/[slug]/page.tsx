import { type Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import Balancer from 'react-wrap-balancer'

import {
  CalendarIcon,
  CursorClickIcon,
  HourglassIcon,
  ScriptIcon,
} from '~/assets'
import { PostPortableText } from '~/components/PostPortableText'
import { Prose } from '~/components/Prose'
import { Container } from '~/components/ui/Container'
import { env } from '~/env.mjs'
import { prettifyNumber } from '~/lib/math'
import { redis } from '~/lib/redis'
import { getBlogPost } from '~/sanity/queries'

export const generateMetadata = async ({
  params,
}: {
  params: { slug: string }
}) => {
  const post = await getBlogPost(params.slug)
  if (!post) {
    notFound()
  }

  const { title, description, mainImage } = post

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: mainImage.asset.url,
        },
      ],
      type: 'article',
    },
    twitter: {
      images: [
        {
          url: mainImage.asset.url,
        },
      ],
      title,
      description,
    },
  } satisfies Metadata
}

export default async function BlogPage({
  params,
}: {
  params: { slug: string }
}) {
  const post = await getBlogPost(params.slug)
  if (!post) {
    notFound()
  }

  let views: number
  if (env.VERCEL_ENV === 'production') {
    views = await redis.incr(`post:views:${post._id}`)
  } else {
    views = 35900
  }

  return (
    <Container className="mt-16 lg:mt-32">
      <div className="xl:relative">
        <div className="mx-auto max-w-2xl">
          {/*{previousPathname && (*/}
          {/*  <button*/}
          {/*    type="button"*/}
          {/*    onClick={() => router.back()}*/}
          {/*    aria-label="Go back to articles"*/}
          {/*    className="group mb-8 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md shadow-zinc-800/5 ring-1 ring-zinc-900/5 transition dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0 dark:ring-white/10 dark:hover:border-zinc-700 dark:hover:ring-white/20 lg:absolute lg:-left-5 lg:-mt-2 lg:mb-0 xl:-top-1.5 xl:left-0 xl:mt-0"*/}
          {/*  >*/}
          {/*    <ArrowLeftIcon className="h-4 w-4 stroke-zinc-500 transition group-hover:stroke-zinc-700 dark:stroke-zinc-500 dark:group-hover:stroke-zinc-400" />*/}
          {/*  </button>*/}
          {/*)}*/}
          <article>
            <header className="flex flex-col">
              <div className="relative mb-7 aspect-[240/135] w-full md:mb-12 md:scale-110">
                <Image
                  src={post.mainImage.asset.url}
                  alt={post.title}
                  className="rounded-3xl ring-1 ring-zinc-900/5 transition dark:ring-0 dark:ring-white/10 dark:hover:border-zinc-700 dark:hover:ring-white/20"
                  placeholder="blur"
                  blurDataURL={post.mainImage.asset.lqip}
                  unoptimized
                  fill
                />
              </div>
              <div className="flex w-full items-center justify-between space-x-4 text-sm font-medium text-zinc-600/80 dark:text-zinc-400/80">
                <span className="inline-flex items-center space-x-1.5">
                  <ScriptIcon />
                  <span>{post.categories.join(', ')}</span>
                </span>
                <time
                  dateTime={post.publishedAt}
                  className="flex items-center space-x-1.5"
                >
                  <CalendarIcon />
                  <span>
                    {Intl.DateTimeFormat('zh').format(
                      new Date(post.publishedAt)
                    )}
                  </span>
                </time>
              </div>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
                <Balancer>{post.title}</Balancer>
              </h1>
              <p className="my-5 text-sm font-medium text-zinc-500">
                <Balancer>{post.description}</Balancer>
              </p>
              <div className="flex w-full items-center space-x-4 text-sm font-medium text-zinc-700/50 dark:text-zinc-300/50">
                <span className="inline-flex items-center space-x-1.5">
                  <CursorClickIcon />
                  <span>{prettifyNumber(views ?? 0, true)}次点击</span>
                </span>

                <span className="inline-flex items-center space-x-1.5">
                  <HourglassIcon />
                  <span>{post.readingTime.toFixed(0)}分钟阅读</span>
                </span>
              </div>
            </header>
            <Prose className="mt-8">
              <PostPortableText value={post.body} />
            </Prose>
          </article>
        </div>
      </div>
    </Container>
  )
}

export const runtime = 'edge'
export const revalidate = 60
