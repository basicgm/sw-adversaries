import '../styles/styles.sass';
import Layout from '../components/layout';
import {NextIntlProvider} from 'next-intl';

function MyApp({Component, pageProps}) {
  return (
    <Layout>
      <NextIntlProvider messages={pageProps.messages}>
        <Component {...pageProps}/>
      </NextIntlProvider>
    </Layout>
  )
}

export default MyApp;
