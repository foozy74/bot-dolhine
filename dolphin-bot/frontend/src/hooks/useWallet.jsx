import React, { createContext, useContext, useEffect, useState } from 'react';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [address, setAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Detect wallet name from provider flags
  const walletName = typeof window !== 'undefined' && window.ethereum
    ? window.ethereum.isRabby
      ? 'Rabby Wallet'
      : window.ethereum.isMetaMask
      ? 'MetaMask'
      : 'Web3 Browser Wallet'
    : null;

  // Check if already authorized on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    const eth = window.ethereum;

    eth.request({ method: 'eth_accounts' })
      .then((accounts) => {
        if (accounts && accounts.length > 0) {
          setAddress(accounts[0]);
          return eth.request({ method: 'eth_chainId' });
        }
        return null;
      })
      .then((cId) => {
        if (cId) {
          setChainId(parseInt(cId, 16));
        }
      })
      .catch((err) => console.debug('Wallet auto-connect silent check:', err));

    const handleAccounts = (accounts) => {
      if (!accounts || accounts.length === 0) {
        setAddress(null);
      } else {
        setAddress(accounts[0]);
      }
    };

    const handleChain = (cId) => {
      if (cId) {
        setChainId(parseInt(cId, 16));
      }
    };

    if (eth.on) {
      eth.on('accountsChanged', handleAccounts);
      eth.on('chainChanged', handleChain);
    }

    return () => {
      if (eth.removeListener) {
        eth.removeListener('accountsChanged', handleAccounts);
        eth.removeListener('chainChanged', handleChain);
      }
    };
  }, []);

  const connect = async () => {
    setError(null);
    if (typeof window === 'undefined' || !window.ethereum) {
      setError('Keine Web3 Wallet (z.B. MetaMask, Rabby) im Browser gefunden.');
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0]);
        const cId = await window.ethereum.request({ method: 'eth_chainId' });
        if (cId) {
          setChainId(parseInt(cId, 16));
        }
      }
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError(err?.message || 'Verbindung abgelehnt');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setError(null);
  };

  const signTypedData = async (typedData) => {
    if (!address || !window.ethereum) {
      throw new Error('Wallet nicht verbunden');
    }

    const payload = typeof typedData === 'string' ? typedData : JSON.stringify(typedData);
    const signature = await window.ethereum.request({
      method: 'eth_signTypedData_v4',
      params: [address, payload]
    });
    return signature;
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        chainId,
        isConnected: Boolean(address),
        isConnecting,
        walletName,
        error,
        connect,
        disconnect,
        signTypedData
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
