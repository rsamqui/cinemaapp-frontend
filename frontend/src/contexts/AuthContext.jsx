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
  return decodedToken.exp < currentTime;
};

const mapDecodedTokenToUser = (decodedToken) => {
  if (!decodedToken) return null;
  console.log("AuthContext (mapDecodedTokenToUser): Original decodedToken:", JSON.stringify(decodedToken));
  const user = {
    id: decodedToken.sub || decodedToken.id || decodedToken.userId,
    email: decodedToken.email,
    name: decodedToken.name || '',
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
/*
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
*/

const login = async (credentials) => {
    try {
        const loginResponse = await authService.login(credentials);
        console.log("AuthContext (login): Login service response:", JSON.stringify(loginResponse));

        if (loginResponse.token) {
            localStorage.setItem('token', loginResponse.token);

            let userToSet = null;

            if (loginResponse.user && loginResponse.user.id) {
                console.log("AuthContext (login): Using user object from loginResponse:", JSON.stringify(loginResponse.user));
                userToSet = {
                    id: loginResponse.user.id,
                    name: loginResponse.user.name || '',
                    email: loginResponse.user.email,
                    roles: loginResponse.user.roles || (loginResponse.user.role ? [loginResponse.user.role] : [])
                };
            } else {
                console.log("AuthContext (login): User object not in loginResponse, decoding token.");
                try {
                    const decoded = jwtDecode(loginResponse.token);
                    userToSet = mapDecodedTokenToUser(decoded);
                } catch (e) { console.error("AuthContext (login): Invalid token after login:", e); }
            }

            if (userToSet && userToSet.id) { 
                setUser(userToSet);
                setIsAuthenticated(true);
                localStorage.setItem('user', JSON.stringify(userToSet));
                console.log("AuthContext (login): User state set to:", JSON.stringify(userToSet));
            } else {
                throw new Error("User data could not be established after login (name might be missing).");
            }
        } else {
            throw new Error("No token received from login.");
        }
        return loginResponse;
    } catch (error) {
        console.error("AuthContext (login): Login failed.", error);
        authService.logout();
        setUser(null);
        setToken(null);
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
    try { 
      const data = await authService.register(userData);
      if (data.token) {
        const success = processToken(data.token);
        if (!success) {
          console.warn("Token from registration was invalid or expired.");
          
        }
      }
      return data;
    } catch (error) { 
      console.error("Registration failed in AuthContext:", error);
      throw error;
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
    } else { 
      hasTheRole = currentUserRoles.includes(roleOrRoles);
    }
    console.log(`AuthContext (hasRole): Result: ${hasTheRole}`);
    return hasTheRole;
  }, [user]); 

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    roles: user?.roles || [], 
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
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