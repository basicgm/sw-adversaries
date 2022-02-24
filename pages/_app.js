import '../styles/base.sass'

function MyApp({Component, pageProps}) {
  return (
    <Layout>
      <Component {...pageProps}/>
    </Layout>
  )
}

export default MyApp;
