import { useEffect } from 'react'
import styled, { ThemeProvider } from 'styled-components'
import { Provider } from 'react-redux'
import ClassJoinModal from './components/modal/ClassJoinModal'
import ClassMgmtModal from './components/modal/ClassMgmtModal'
import { GlobalStyles, theme } from './styles'
import { store } from './store'
import { webSocketManager } from './services/webSocketManager'

function App() {
  // App-level WebSocket cleanup for browser events
  useEffect(() => {
    console.log('🚀 App mounted, setting up WebSocket cleanup handlers');
    
    const handleBeforeUnload = () => {
      console.log('📦 Page unloading, disconnecting WebSocket');
      webSocketManager.disconnect();
    };
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        console.log('👁️ Page hidden, user likely navigating away');
        // Don't disconnect immediately - user might be switching tabs
        // WebSocket will handle reconnection if needed
      } else if (document.visibilityState === 'visible') {
        console.log('👁️ Page visible, user returned');
        // Connection will be re-established if needed by components
      }
    };

    // Only handle actual page unload/refresh, not tab switches
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      console.log('🛑 App unmounting, cleaning up event listeners only');
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Note: WebSocket should persist even if App component unmounts (React StrictMode)
      // Only disconnect on actual browser page unload (beforeunload event)
    };
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <AppContainer>
          <ModalContainer>
            <ClassJoinModal />
            <ClassMgmtModal />
          </ModalContainer>
        </AppContainer>
      </ThemeProvider>
    </Provider>
  )
}

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #3952A4 0%, #50C7C5 25%, #FAD613 50%, #E11C28 75%, #CB2B5C 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.lg};
`

const ModalContainer = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  max-width: 1200px;
  width: 100%;
  align-items: flex-start;
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    flex-direction: column;
    max-width: 600px;
    align-items: center;
  }
`

export default App
