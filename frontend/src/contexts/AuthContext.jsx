import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import authService from '../services/auth';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

const isTokenExpired = (decodedToken) => {
  if (!decodedToken || !decodedToken.exp) {
    console.warn("isTokenExpired: No expiration claim or no token.");
    return true;
  }
  const currentTime = Date.now() / 1000;
  // console.log(`isTokenExpired: CurrentTime: ${currentTime}, Token Expires: ${decodedToken.exp}, Expired: ${decodedToken.exp < currentTime}`);
  return decodedToken.exp < currentTime;
};

const mapDecodedTokenToUser = (decodedToken) => {
  if (!decodedToken) return null;
  console.log("AuthContext (mapDecodedTokenToUser): Original decodedToken:", JSON.stringify(decodedToken));
  const user = {
    id: decodedToken.sub || decodedToken.id || decodedToken.userId,
    email: decodedToken.email,
    name: decodedToken.name,
    roles: decodedToken.roles || (decodedToken.role ? [decodedToken.role] : []),
  };
  console.log("AuthContext (mapDecodedTokenToUser): Mapped user object:", JSON.stringify(user));
  return user;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const processToken = useCallback((rawToken) => {
    console.log("AuthContext (processToken): Processing token:", rawToken ? rawToken.substring(0, 20) + "..." : "null");
    if (!rawToken) {
      authService.logout();
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      console.log("AuthContext (processToken): No raw token, logged out state.");
      return false;
    }

    try {
      const decodedToken = jwtDecode(rawToken);
      console.log("AuthContext (processToken): Decoded token content:", JSON.stringify(decodedToken));
      if (isTokenExpired(decodedToken)) {
        console.warn("AuthContext (processToken): Token is expired.");
        authService.logout();
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        return false;
      } else {
        localStorage.setItem('token', rawToken);
        const mappedUser = mapDecodedTokenToUser(decodedToken);
        setUser(mappedUser);
        setToken(rawToken);
        setIsAuthenticated(true);
        console.log("AuthContext (processToken): Token processed successfully. User set:", JSON.stringify(mappedUser));
        return true;
      }
    } catch (error) {
      console.error("AuthContext (processToken): Invalid token during processing.", error);
      authService.logout();
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      return false;
    }
  }, []);

  useEffect(() => {
    console.log("AuthContext: Initializing, checking for stored token...");
    setIsLoading(true);
    const storedToken = authService.getToken();
    if (storedToken) {
      console.log("AuthContext: Found stored token, processing...");
      processToken(storedToken);
    } else {
      console.log("AuthContext: No stored token found.");
    }
    setIsLoading(false);
    console.log("AuthContext: Initialization complete. isLoading:", false);
  }, [processToken]);

  const login = async (credentials) => {
    console.log("AuthContext (login): Attempting login with credentials:", credentials.email);
    try {
      const data = await authService.login(credentials);
      console.log("AuthContext (login): Login service response:", data);
      if (data.token) {
        const success = processToken(data.token);
        if (!success) {
          throw new Error("Invalid or expired token received after login.");
        }
        console.log("AuthContext (login): Login successful, auth state updated.");
      } else {
        console.error("AuthContext (login): No token received from login service.");
        throw new Error("No token received from login.");
      }
      return data;
    } catch (error) {
      console.error("AuthContext (login): Login failed.", error);
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const logout = useCallback(() => {
    console.log("AuthContext (logout): Logging out.");
    authService.logout();
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const register = async (userData) => {
    // Register service might return a token upon successful registration (auto-login)
    // or just a success message.
    try { // <<< --- ADDED try block
      const data = await authService.register(userData);
      if (data.token) { // If backend auto-logins and returns a token
        const success = processToken(data.token);
        if (!success) {
          console.warn("Token from registration was invalid or expired.");
          // Decide if you want to throw an error here or just let registration succeed without login
        }
      }
      return data; // Return data from registration attempt
    } catch (error) { // <<< --- ADDED catch block
      console.error("Registration failed in AuthContext:", error);
      throw error; // Re-throw error to be handled by the component calling register
    }
  };

  const hasRole = useCallback((roleOrRoles) => {
    const currentUserRoles = user?.roles || [];
    console.log(`AuthContext (hasRole): Checking. User roles: ${JSON.stringify(currentUserRoles)}, Required: ${JSON.stringify(roleOrRoles)}`);
    if (currentUserRoles.length === 0) {
      console.log("AuthContext (hasRole): User has no roles. Returning false.");
      return false;
    }
    let hasTheRole = false;
    if (Array.isArray(roleOrRoles)) {
      hasTheRole = currentUserRoles.some(userRole => roleOrRoles.includes(userRole));
    } else { // If a single role string is passed (though ProtectedRoute should send array)
      hasTheRole = currentUserRoles.includes(roleOrRoles);
    }
    console.log(`AuthContext (hasRole): Result: ${hasTheRole}`);
    return hasTheRole;
  }, [user]); // Depend on user object

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    roles: user?.roles || [], // Kept for direct access if needed
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* It's often better to let consumers of isLoading decide how to render loading state */}
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined || context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};