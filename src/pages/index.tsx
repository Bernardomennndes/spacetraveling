import { GetStaticProps } from 'next';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Prismic from '@prismicio/client';
import Header from '../components/Header';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

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
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  return (
    <>
      <Header />

      <section className={styles.postsContainer}>
        {postsPagination.results.map(post => {
          return (
            <div key={post.uid} className={styles.postContent}>
              <h1>{post.data.title}</h1>
              <h2>{post.data.subtitle}</h2>
              <div className={styles.postInfo}>
                <div>
                  <FiCalendar />
                  <p>{post.first_publication_date}</p>
                </div>
                <div>
                  <FiUser />
                  <p>{post.data.author}</p>
                </div>
              </div>
            </div>
          );
        })}

        {postsPagination?.next_page && (
          <button className={styles.loadPostsButton} type="button">
            Carregar mais posts
          </button>
        )}
      </section>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  // Retornar todos os posts com paginação, alterar o valor page size
  const postsResponse = await prismic.query(
    Prismic.predicates.at('document.type', 'posts'),
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 5,
    }
  );

  const posts = postsResponse.results.map(post => {
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

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  return {
    props: {
      postsPagination,
    },
    revalidate: 1,
  };
};
