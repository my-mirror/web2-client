import { useRef, useEffect } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { useMutation } from 'react-query';
import { request } from '~/shared/libs';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';

const sessionStorageKey = 'auth_v1_token';
const tonProofStorageKey = 'stored_ton_proof';
const payloadTTLMS = 1000 * 60 * 20;

export const useAuth = () => {
    const WebApp = useWebApp();
    const [tonConnectUI] = useTonConnectUI();
    const interval = useRef<ReturnType<typeof setInterval> | undefined>();

    // Store ton_proof when it becomes available
    useEffect(() => {
        if (
            tonConnectUI.wallet?.connectItems?.tonProof &&
            !('error' in tonConnectUI.wallet.connectItems.tonProof) &&
            tonConnectUI.wallet.account
        ) {
            console.log('DEBUG: Storing ton_proof for future use');
            localStorage.setItem(
                tonProofStorageKey,
                JSON.stringify({
                    timestamp: Date.now(),
                    account: tonConnectUI.wallet.account,
                    proof: tonConnectUI.wallet.connectItems.tonProof.proof,
                })
            );
        }
    }, [tonConnectUI.wallet?.connectItems?.tonProof, tonConnectUI.wallet?.account]);

    const makeAuthRequest = async (params: {
        twa_data: string;
        ton_proof?: {
            account: any;
            ton_proof: any;
        };
    }) => {
        try {
            const res = await request.post<{
                connected_wallet: null | {
                    version: string;
                    address: string;
                    ton_balance: string;
                };
                auth_v1_token: string;
            }>('/auth.twa', params);

            if (res?.data?.auth_v1_token) {
                localStorage.setItem(sessionStorageKey, res.data.auth_v1_token);

                // If we sent a proof, it was accepted, so keep record of that
                if (params.ton_proof) {
                    console.log('DEBUG: Auth with proof successful');
                }
            } else {
                throw new Error('Failed to get auth token');
            }
            return res;
        } catch (error) {
            // If we were using ton_proof and it failed, clear stored proof
            if (params.ton_proof) {
                console.log('DEBUG: Auth with proof failed, clearing stored proof');
                localStorage.removeItem(tonProofStorageKey);
            }
            throw error;
        }
    };

    const makeSelectWalletRequest = async (params: { wallet_address: string }) => {
        try {
            const res = await request.post('/auth.selectWallet', params);
            return res;
        } catch (error: any) {
            // Check for 404 error (wallet not found or invalid)
            if (error.response?.status === 404) {
                console.log('DEBUG: Wallet selection failed with 404, disconnecting');
                await tonConnectUI.disconnect();
                localStorage.removeItem(sessionStorageKey);
                localStorage.removeItem(tonProofStorageKey);
            }
            throw error;
        }
    };

    // Helper to prepare the connection parameters with proof requirements
    const prepareConnectParams = async () => {
        console.log('DEBUG: Preparing connect parameters');

        // Set to loading state first
        tonConnectUI.setConnectRequestParameters({ state: 'loading' });

        try {
            // Get the payload/token from backend
            const value = await request.post<{ auth_v1_token: string }>('/auth.twa', {
                twa_data: WebApp.initData,
            });

            if (value?.data?.auth_v1_token) {
                console.log('DEBUG: Got token for connect params');

                // Set the parameters to ready with tonProof requirement
                tonConnectUI.setConnectRequestParameters({
                    state: 'ready',
                    value: { tonProof: value.data.auth_v1_token },
                });
                return true;
            } else {
                console.log('DEBUG: No token received for connect params');
                tonConnectUI.setConnectRequestParameters(null);
                return false;
            }
        } catch (error) {
            console.error('DEBUG: Error preparing connect params:', error);
            tonConnectUI.setConnectRequestParameters(null);
            return false;
        }
    };

    // Helper to check if connection is capable of transactions
    const isConnectionValid = () => {
        if (!tonConnectUI.connected || !tonConnectUI.wallet) {
            return false;
        }

        return true;
    };

    return useMutation(['auth'], async () => {
        clearInterval(interval.current);
        let authResult;
        console.log('DEBUG: Starting auth flow');

        try {
            // Case 1: Not connected - need to connect and get proof
            if (!tonConnectUI.connected) {
                console.log('DEBUG: No wallet connection, starting flow');
                localStorage.removeItem(sessionStorageKey);

                // Prepare connection parameters (this sets up the proof requirement)
                const prepared = await prepareConnectParams();

                if (!prepared) {
                    throw new Error('Failed to prepare connection parameters');
                }

                // Start periodic refresh of the payload
                interval.current = setInterval(prepareConnectParams, payloadTTLMS);

                // Open the modal - this will not resolve until connection or cancellation
                await tonConnectUI.openModal();

                // Check if connection was successful
                if (!tonConnectUI.connected) {
                    console.log('DEBUG: Connection cancelled or failed');
                    throw new Error('Wallet connection cancelled or failed');
                }

                // Check if we have a proof after connection
                if (
                    tonConnectUI.wallet?.connectItems?.tonProof &&
                    !('error' in tonConnectUI.wallet.connectItems.tonProof)
                ) {
                    console.log('DEBUG: Got proof after connection');

                    try {
                        // Try auth with the proof
                        authResult = await makeAuthRequest({
                            twa_data: WebApp.initData,
                            ton_proof: {
                                account: tonConnectUI.wallet.account,
                                ton_proof: tonConnectUI.wallet.connectItems.tonProof.proof,
                            },
                        });
                    } catch (error) {
                        // If auth with proof fails, throw the error
                        console.error('DEBUG: Auth with fresh proof failed:', error);
                        throw error;
                    }
                } else {
                    console.log('DEBUG: No proof available after connection');
                    // If we can't get proof but we're connected, try auth without it
                    authResult = await makeAuthRequest({
                        twa_data: WebApp.initData,
                    });
                }
            } else {
                // Case 2: Already connected - try to use stored proof first
                console.log('DEBUG: Already connected');

                // Check if we have a valid stored proof
                const storedProofData = localStorage.getItem(tonProofStorageKey);
                if (storedProofData) {
                    try {
                        const proofData = JSON.parse(storedProofData);

                        // Check if the proof matches current wallet and is not too old
                        if (tonConnectUI.wallet?.account?.address === proofData.account.address) {
                            console.log('DEBUG: Using stored proof');

                            // Try auth with stored proof but ignore errors
                            try {
                                authResult = await makeAuthRequest({
                                    twa_data: WebApp.initData,
                                    ton_proof: {
                                        account: proofData.account,
                                        ton_proof: proofData.proof,
                                    },
                                });

                                // If successful, remove stored proof as it's been used
                                localStorage.removeItem(tonProofStorageKey);
                            } catch (error) {
                                console.log(
                                    'DEBUG: Auth with stored proof failed, proceeding without it'
                                );

                                // Fall back to auth without proof
                                authResult = await makeAuthRequest({
                                    twa_data: WebApp.initData,
                                });
                            }
                        } else {
                            console.log('DEBUG: Stored proof address mismatch');
                            localStorage.removeItem(tonProofStorageKey);

                            // Auth without proof
                            authResult = await makeAuthRequest({
                                twa_data: WebApp.initData,
                            });
                        }
                    } catch (error) {
                        console.error('DEBUG: Error parsing stored proof:', error);
                        localStorage.removeItem(tonProofStorageKey);

                        // Auth without proof
                        authResult = await makeAuthRequest({
                            twa_data: WebApp.initData,
                        });
                    }
                } else {
                    // No stored proof, check if we have a live proof
                    if (
                        tonConnectUI.wallet?.connectItems?.tonProof &&
                        !('error' in tonConnectUI.wallet.connectItems.tonProof)
                    ) {
                        console.log('DEBUG: Using live proof from wallet');
                        try {
                            // Try auth with the live proof
                            authResult = await makeAuthRequest({
                                twa_data: WebApp.initData,
                                ton_proof: {
                                    account: tonConnectUI.wallet.account,
                                    ton_proof: tonConnectUI.wallet.connectItems.tonProof.proof,
                                },
                            });
                        } catch (error) {
                            console.log(
                                'DEBUG: Auth with live proof failed, proceeding without it'
                            );

                            // Fall back to auth without proof
                            authResult = await makeAuthRequest({
                                twa_data: WebApp.initData,
                            });
                        }
                    } else {
                        // Connected without proof - already authenticated
                        console.log('DEBUG: Connected without proof, proceeding without it');
                        authResult = await makeAuthRequest({
                            twa_data: WebApp.initData,
                        });
                    }
                }
            }

            // Always try to select wallet after auth (this validates the connection)
            if (tonConnectUI.wallet?.account?.address) {
                console.log('DEBUG: Selecting wallet', tonConnectUI.wallet.account.address);
                try {
                    await makeSelectWalletRequest({
                        wallet_address: tonConnectUI.wallet.account.address,
                    });

                    // Additional validation check
                    if (!isConnectionValid()) {
                        console.log('DEBUG: Connection validation failed, disconnecting');
                        await tonConnectUI.disconnect();
                        localStorage.removeItem(sessionStorageKey);
                        localStorage.removeItem(tonProofStorageKey);
                        throw new Error('Connection validation failed');
                    }
                } catch (error) {
                    // Errors from makeSelectWalletRequest are already handled
                    console.error('DEBUG: Wallet selection failed:', error);
                    throw error;
                }
            }

            return authResult;
        } catch (error) {
            console.error('DEBUG: Auth flow failed:', error);
            throw error;
        } finally {
            clearInterval(interval.current);
        }
    });
};
