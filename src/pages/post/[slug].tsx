import { useEffect, useState } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { PreviewButton } from '../../components/PreviewButton';
import UtterancesComments from '../../components/UterrancesComments';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  uid: string;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  preview: boolean;
  post: Post;
  nextPost: Post | null;
  prevPost: Post | null;
}

export default function Post({
  preview,
  post,
  nextPost,
  prevPost,
}: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <p>Carregando...</p>;
  }

  let contentTextBuilder = '';

  post.data.content.forEach(postContent => {
    contentTextBuilder += postContent.heading;
    contentTextBuilder += RichText.asText(postContent.body);
  });

  const readTime = Math.ceil(contentTextBuilder.split(/\s/g).length / 200);

  return (
    <>
      <main>
        <Header />
        <img
          className={styles.bannerImage}
          src={post.data.banner.url}
          alt="banner"
        />
        <article className={styles.articleContainer}>
          <div className={commonStyles.postContent}>
            <h1>{post.data.title}</h1>
            <div className={commonStyles.postInfo}>
              <time>
                <FiCalendar />
                <p>
                  {format(
                    new Date(post.first_publication_date),
                    'dd MMM yyyy',
                    {
                      locale: ptBR,
                    }
                  )}
                </p>
              </time>
              <span>
                <FiUser />
                <p>{post.data.author}</p>
              </span>
              <span>
                <FiClock />
                <p>{readTime} min</p>
              </span>
            </div>
            {post.last_publication_date && (
              <p className={styles.editedArticle}>
                * editado em{' '}
                {format(new Date(post.last_publication_date), 'dd MMM yyyy', {
                  locale: ptBR,
                })}
                , ??s{' '}
                {format(new Date(post.last_publication_date), 'kk:mm', {
                  locale: ptBR,
                })}
              </p>
            )}
          </div>
          <div className={styles.articleContent}>
            {post.data.content.map(postContent => {
              return (
                <div key={postContent.heading}>
                  <h2>{postContent.heading}</h2>
                  <div
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{
                      __html: RichText.asHtml(postContent.body),
                    }}
                  />
                </div>
              );
            })}
          </div>
        </article>
        <section
          className={`${commonStyles.maxComponentWidth} ${styles.offArticleContainer}`}
        >
          <div className={styles.linksContainer}>
            {prevPost && (
              <div>
                <h2>{prevPost.data.title}</h2>
                <Link href={`/post/${prevPost.uid}`}>
                  <a>Previous post</a>
                </Link>
              </div>
            )}

            {nextPost && (
              <div className={styles.nextPostLink}>
                <h2>{nextPost.data.title}</h2>
                <Link href={`/post/${nextPost.uid}`}>
                  <a>Next post</a>
                </Link>
              </div>
            )}
          </div>
          <UtterancesComments />
          {preview && <PreviewButton />}
        </section>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 2,
    }
  );

  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const { slug } = params;
  const prismic = getPrismicClient();

  const response = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref ?? null,
  });

  const nextPost = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      orderings: '[document.first_publication_date]',
      after: response.id,
    }
  );

  const prevPost = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      orderings: '[document.first_publication_date desc]',
      after: response.id,
    }
  );

  return {
    props: {
      preview,
      post: response,
      nextPost: nextPost.results[0] ?? null,
      prevPost: prevPost.results[0] ?? null,
    },
    revalidate: 60 * 10, // 10 minutes
  };
};
