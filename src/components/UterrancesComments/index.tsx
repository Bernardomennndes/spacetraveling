import { useEffect } from 'react';

const addUtterancesScript = (
  parentElement: HTMLElement,
  repo: string,
  label: string,
  issueTerm: string,
  theme: string,
  isIssueNumber: boolean
): void => {
  const script = document.createElement('script');
  script.setAttribute('src', 'https://utteranc.es/client.js');
  script.setAttribute('crossorigin', 'anonymous');
  script.setAttribute('async', 'true');
  script.setAttribute('repo', repo);

  if (label !== '') {
    script.setAttribute('label', label);
  }

  if (isIssueNumber) {
    script.setAttribute('issue-number', issueTerm);
  } else {
    script.setAttribute('issue-term', issueTerm);
  }

  script.setAttribute('theme', theme);

  parentElement.appendChild(script);
};

const UtterancesComments = (): JSX.Element => {
  const repo = process.env.NEXT_PUBLIC_UTTERANC_GITHUB_REPO;
  const theme = 'photon-dark';
  const issueTerm = 'pathname';
  const label = 'Comments';

  useEffect(() => {
    const commentsBox = document.getElementById('commentsBox');

    if (!commentsBox) {
      return;
    }

    const utterances = document.getElementsByClassName('utterances')[0];

    if (utterances) {
      utterances.remove();
    }

    addUtterancesScript(commentsBox, repo, label, issueTerm, theme, false);
  });

  return <div id="commentsBox" />;
};

export default UtterancesComments;
