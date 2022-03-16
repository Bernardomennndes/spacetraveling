/* eslint-disable prettier/prettier */
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
import { UterrancesComments } from '../../components/UterrancesComments';

interface Post {
  first_publication_date: string | null;
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
}

export default function Post({ preview, post }: PostProps): JSX.Element {

  const router = useRouter();

  if (router.isFallback) {
    return <p>Carregando...</p>
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
        <img className={styles.bannerImage} src={post.data.banner.url} alt="banner" />
        <article className={styles.articleContainer}>
          <div className={commonStyles.postContent}>
            <h1>{post.data.title}</h1>
            <div className={commonStyles.postInfo}>
              <time>
                <FiCalendar />
                <p>{format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                  locale: ptBR,
                })}</p>
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
            <p className={styles.editedArticle}>* editado em 19 mar 2021, às 15:49</p>
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
        <section className={`${commonStyles.maxComponentWidth} ${styles.offArticleContainer}`}>
          <div className={styles.linksContainer}>
            <div>
              <h2>Como utilizar Hooks</h2>
              <Link href="/">
                <a>Previous post</a>
              </Link>
            </div>
            <div>
              <h2>Criando um app CRA do Zero</h2>
              <Link href="/">
                <a>Next post</a>
              </Link>
            </div>
          </div>
          <UterrancesComments />
          {preview && (
            <PreviewButton />
          )}
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

  return {
    props: {
      preview,
      post: response,
    },
    revalidate: 60 * 10 // 24 hours
  }
};
