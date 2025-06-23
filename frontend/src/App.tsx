import { ThemeProvider } from 'styled-components'
import { Provider } from 'react-redux'
import { AppContent } from './pages'
import { GlobalStyles, theme } from './styles'
import { store } from './store'

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <AppContent />
      </ThemeProvider>
    </Provider>
  )
}

export default App
