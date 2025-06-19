import styled, { ThemeProvider } from 'styled-components'
import JoinClassModal from './components/JoinClassModal'
import StudentManagementModal from './components/StudentManagementModal'
import { theme } from './theme/theme'
import './App.css'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AppContainer>
        <ModalContainer>
          <JoinClassModal />
          <StudentManagementModal />
        </ModalContainer>
      </AppContainer>
    </ThemeProvider>
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
