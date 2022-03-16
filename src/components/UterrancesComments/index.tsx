export function UterrancesComments(): JSX.Element {
  return (
    <>
      <section
        style={{
          marginTop: '80px',
        }}
        ref={element => {
          if (!element) {
            return;
          }
          const scriptElem = document.createElement('script');
          scriptElem.src = 'https://utteranc.es/client.js';
          scriptElem.async = true;
          scriptElem.crossOrigin = 'anonymous';
          scriptElem.setAttribute('repo', 'nelsonsantosaraujo/spacetraveling');
          scriptElem.setAttribute('issue-term', 'pathname');
          scriptElem.setAttribute('label', 'blog-comment');
          scriptElem.setAttribute('theme', 'photon-dark');
          element.appendChild(scriptElem);
        }}
      />
    </>
  );
}
