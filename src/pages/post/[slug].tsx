/* eslint-disable prettier/prettier */
import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

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
  post: Post;
}

export default function Post({ post } : PostProps) {
  return(
    <>

    </>
  );
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();

  // Buscar todos os posts
  const posts = await prismic.query();

  // TODO
};

export const getStaticProps = async context => {
  const prismic = getPrismicClient();

  // Buscar infos do post específico
  const response = await prismic.getByUID();

  return {
    props: {

    },
    revalidate: 0
  }
};
