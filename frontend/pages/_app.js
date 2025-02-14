/**
 * Custom App component for Next.js.
 * Applies global CSS styles and resets (via reset.css).
 */

import '../styles/globals.css'
import 'antd/dist/reset.css'

function MyApp({ Component, pageProps }) {

  return <Component {...pageProps} />
}

export default MyApp
