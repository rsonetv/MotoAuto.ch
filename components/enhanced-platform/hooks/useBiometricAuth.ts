"use client"

import { useState, useEffect } from 'react'

interface BiometricAuthResult {
  success: boolean
  error?: string
  method?: 'face_id' | 'touch_id'
}

interface PublicKeyCredentialCreationOptions {
  challenge: Uint8Array
  rp: {
    name: string
    id?: string
  }
  user: {
    id: Uint8Array
    name: string
    displayName: string
  }
  pubKeyCredParams: Array<{
    type: 'public-key'
    alg: number
  }>
  authenticatorSelection?: {
    authenticatorAttachment?: 'platform' | 'cross-platform'
    userVerification?: 'required' | 'preferred' | 'discouraged'
  }
  timeout?: number
  attestation?: 'none' | 'indirect' | 'direct'
}

interface PublicKeyCredentialRequestOptions {
  challenge: Uint8Array
  timeout?: number
  rpId?: string
  allowCredentials?: Array<{
    type: 'public-key'
    id: Uint8Array
  }>
  userVerification?: 'required' | 'preferred' | 'discouraged'
}

export function useBiometricAuth() {
  const [isSupported, setIsSupported] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)
  const [availableMethods, setAvailableMethods] = useState<string[]>([])
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  useEffect(() => {
    checkSupport()
    loadSettings()
  }, [])

  const checkSupport = async () => {
    if (typeof window === 'undefined') return

    // Check for WebAuthn support
    const webAuthnSupported = !!(
      window.PublicKeyCredential &&
      window.navigator.credentials &&
      window.navigator.credentials.create &&
      window.navigator.credentials.get
    )

    if (webAuthnSupported) {
      try {
        const available = await (window.PublicKeyCredential as any).isUserVerifyingPlatformAuthenticatorAvailable()
        setIsSupported(available)
        
        if (available) {
          // Detect available methods based on platform
          const methods = []
          if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
            methods.push('face_id', 'touch_id')
          } else if (navigator.userAgent.includes('Android')) {
            methods.push('fingerprint')
          } else {
            methods.push('biometric')
          }
          setAvailableMethods(methods)
        }
      } catch (error) {
        console.error('Error checking biometric support:', error)
        setIsSupported(false)
      }
    }
  }

  const loadSettings = () => {
    if (typeof window === 'undefined') return
    
    const enabled = localStorage.getItem('biometric_auth_enabled') === 'true'
    setIsEnabled(enabled)
  }

  const saveSettings = (enabled: boolean) => {
    if (typeof window === 'undefined') return
    
    localStorage.setItem('biometric_auth_enabled', enabled.toString())
    if (enabled) {
      localStorage.setItem('biometric_auth_last_used', new Date().toISOString())
    }
    setIsEnabled(enabled)
  }

  const generateChallenge = (): Uint8Array => {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return array
  }

  const stringToUint8Array = (str: string): Uint8Array => {
    return new TextEncoder().encode(str)
  }

  const register = async (username: string): Promise<BiometricAuthResult> => {
    if (!isSupported) {
      return { success: false, error: 'Biometric authentication not supported' }
    }

    setIsAuthenticating(true)

    try {
      const challenge = generateChallenge()
      const userId = stringToUint8Array(username)

      const createOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: 'MotoAuto.ch',
          id: window.location.hostname
        },
        user: {
          id: userId,
          name: username,
          displayName: username
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 }, // ES256
          { type: 'public-key', alg: -257 } // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required'
        },
        timeout: 60000,
        attestation: 'none'
      }

      const credential = await navigator.credentials.create({
        publicKey: createOptions
      }) as PublicKeyCredential

      if (credential) {
        // Store credential ID for future authentication
        localStorage.setItem('biometric_credential_id', credential.id)
        saveSettings(true)
        
        return { 
          success: true, 
          method: availableMethods.includes('face_id') ? 'face_id' : 'touch_id' 
        }
      }

      return { success: false, error: 'Failed to create credential' }
    } catch (error: any) {
      console.error('Biometric registration error:', error)
      return { 
        success: false, 
        error: error.message || 'Registration failed' 
      }
    } finally {
      setIsAuthenticating(false)
    }
  }

  const authenticate = async (): Promise<BiometricAuthResult> => {
    if (!isSupported || !isEnabled) {
      return { success: false, error: 'Biometric authentication not available' }
    }

    setIsAuthenticating(true)

    try {
      const challenge = generateChallenge()
      const credentialId = localStorage.getItem('biometric_credential_id')

      if (!credentialId) {
        return { success: false, error: 'No biometric credentials found' }
      }

      const getOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        timeout: 60000,
        rpId: window.location.hostname,
        allowCredentials: [{
          type: 'public-key',
          id: stringToUint8Array(credentialId)
        }],
        userVerification: 'required'
      }

      const credential = await navigator.credentials.get({
        publicKey: getOptions
      }) as PublicKeyCredential

      if (credential) {
        localStorage.setItem('biometric_auth_last_used', new Date().toISOString())
        
        return { 
          success: true, 
          method: availableMethods.includes('face_id') ? 'face_id' : 'touch_id' 
        }
      }

      return { success: false, error: 'Authentication failed' }
    } catch (error: any) {
      console.error('Biometric authentication error:', error)
      return { 
        success: false, 
        error: error.message || 'Authentication failed' 
      }
    } finally {
      setIsAuthenticating(false)
    }
  }

  const disable = () => {
    localStorage.removeItem('biometric_credential_id')
    localStorage.removeItem('biometric_auth_last_used')
    saveSettings(false)
  }

  return {
    isSupported,
    isEnabled,
    availableMethods,
    isAuthenticating,
    register,
    authenticate,
    disable,
    enable: (username: string) => register(username)
  }
}