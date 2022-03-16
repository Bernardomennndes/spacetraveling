import { useState } from 'react';
import { GetStaticProps } from 'next';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Link from 'next/link';
import Prismic from '@prismicio/client';
import Header from '../components/Header';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { PreviewButton } from '../components/PreviewButton';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  preview: boolean;
  postsPagination: PostPagination;
}

export default function Home({
  preview,
  postsPagination,
}: HomeProps): JSX.Element {
  const [postsListing, setPostsListing] = useState<Post[]>(
    postsPagination.results
  );
  const [postsNextPage, setPostsNextPage] = useState(postsPagination.next_page);

  const handleRefreshPostsListing = async (): Promise<void> => {
    const response = fetch(postsPagination.next_page).then(fetchResponse =>
      fetchResponse.json()
    );

    const fetchResponseData = response.then(({ next_page, results }) => {
      return { next_page, results };
    });

    const newFetchedPosts = (await fetchResponseData).results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: format(
          new Date(post.first_publication_date),
          'd MMM y',
          {
            locale: ptBR,
          }
        ),
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    });

    setPostsNextPage(newFetchedPosts.next_page);
    setPostsListing([...postsListing, ...newFetchedPosts]);
  };

  return (
    <>
      <Header />

      <section
        className={commonStyles.maxComponentWidth}
        style={{ paddingBottom: '80px' }}
      >
        {postsListing.map(post => {
          return (
            <div
              key={post.uid}
              className={`${styles.postContent} ${commonStyles.postContent}`}
            >
              <Link href={`post/${post.uid}`}>
                <a>
                  <h1>{post.data.title}</h1>
                  <h2>{post.data.subtitle}</h2>
                  <div className={commonStyles.postInfo}>
                    <time>
                      <FiCalendar />
                      <p>
                        {format(
                          new Date(post.first_publication_date),
                          'd MMM y',
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
                  </div>
                </a>
              </Link>
            </div>
          );
        })}

        {postsNextPage && (
          <button
            className={styles.loadPostsButton}
            type="button"
            onClick={() => {
              handleRefreshPostsListing();
            }}
          >
            Carregar mais posts
          </button>
        )}
      </section>

      {preview && <PreviewButton />}
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    Prismic.predicates.at('document.type', 'posts'),
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 5,
      ref: previewData?.ref ?? null,
    }
  );

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results,
  };

  return {
    props: {
      postsPagination,
      preview,
    },
    revalidate: 60 * 60 * 24, // 24 horas
  };
};
