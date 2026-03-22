import { AuthProvider } from './AuthContext';
import { UserProvider } from './UserContext';
import { ChatProvider } from './ChatContext';
import { SocketProvider } from './SocketContext';
import { ThemeProvider } from './ThemeContext';

/**
 * Combined App Provider
 * Wraps all context providers in the correct order
 * Order matters: Theme -> Auth -> User -> Chat -> Socket
 */
export const AppProvider = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UserProvider>
          <ChatProvider>
            <SocketProvider>
              {children}
            </SocketProvider>
          </ChatProvider>
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};
