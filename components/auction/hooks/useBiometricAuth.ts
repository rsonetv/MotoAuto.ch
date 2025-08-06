import { useState } from 'react';

const useBiometricAuth = () => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const authenticate = async () => {
    setIsAuthenticating(true);
    try {
      // Replace with actual biometric authentication logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Authenticated!');
      return true;
    } catch (error) {
      console.error('Authentication failed', error);
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  return { isAuthenticating, authenticate };
};

export default useBiometricAuth;