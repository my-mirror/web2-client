import { useRef } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { useMutation } from 'react-query';
import { request } from '~/shared/libs';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';

const sessionStorageKey = 'auth_v1_token';
const payloadTTLMS = 1000 * 60 * 20;

export const useAuth = () => {
    const WebApp = useWebApp();
    // const wallet = useTonWallet();
    const [tonConnectUI] = useTonConnectUI();
    const interval = useRef<ReturnType<typeof setInterval> | undefined>();

    const waitForWalletProof = async () => {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Timeout waiting for proof')), 30000);
            const checkProof = setInterval(() => {
                const currentWallet = tonConnectUI.wallet;
                if (
                    currentWallet?.connectItems?.tonProof &&
                    !('error' in currentWallet.connectItems.tonProof)
                ) {
                    clearInterval(checkProof);
                    clearTimeout(timeout);
                    resolve(currentWallet.connectItems.tonProof.proof);
                }
            }, 500);
        });
    };

    const makeAuthRequest = async (params: {
        twa_data: string;
        ton_proof?: {
            account: any;
            ton_proof: any;
        };
    }) => {
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
        } else {
            throw new Error('Failed to get auth token');
        }
        return res;
    };

    const makeSelectWalletRequest = async (params: { wallet_address: string }) => {
        const res = await request.post('/auth.selectWallet', params);
        return res;
    };

    return useMutation(['auth'], async () => {
        clearInterval(interval.current);
        let authResult;
        console.log('DEBUG: Starting auth flow');

        // Case 1: Not connected - need to connect and get proof
        if (!tonConnectUI.connected) {
            console.log('DEBUG: No wallet connection, starting flow');
            localStorage.removeItem(sessionStorageKey);

            const refreshPayload = async () => {
                tonConnectUI.setConnectRequestParameters({ state: 'loading' });
                const value = await request.post<{ auth_v1_token: string }>('/auth.twa', {
                    twa_data: WebApp.initData,
                });

                if (value?.data?.auth_v1_token) {
                    tonConnectUI.setConnectRequestParameters({
                        state: 'ready',
                        value: { tonProof: value.data.auth_v1_token },
                    });
                } else {
                    tonConnectUI.setConnectRequestParameters(null);
                }
            };

            await refreshPayload();
            interval.current = setInterval(refreshPayload, payloadTTLMS);

            const tonProof = await waitForWalletProof();
            console.log('DEBUG: Got initial proof', tonProof);

            authResult = await makeAuthRequest({
                twa_data: WebApp.initData,
                ton_proof: {
                    account: tonConnectUI.wallet!.account,
                    ton_proof: tonProof,
                },
            });
        } else {
            // Case 3: Connected without proof - already authenticated
            console.log('DEBUG: Connected without proof, proceeding without it');
            authResult = await makeAuthRequest({
                twa_data: WebApp.initData,
            });
        }

        if (tonConnectUI.wallet?.account?.address) {
            console.log('DEBUG: Selecting wallet', tonConnectUI.wallet.account.address);
            await makeSelectWalletRequest({ wallet_address: tonConnectUI.wallet.account.address });
        }

        return authResult;

        // Commented this part for two reasons:
        // 1) When we include ton_proof from the wallet it fails the call for a reason of bad ton_proof
        // 2) This call could happen only if the first case happened and it means that the ton_proof is already have been stored once before
        // Case 2: Connected with proof - use it
        // if (wallet?.connectItems?.tonProof && !("error" in wallet.connectItems.tonProof)) {
        //   console.log("DEBUG: Using existing proof", wallet.connectItems.tonProof.proof);
        //   return makeAuthRequest({
        //     twa_data: WebApp.initData,
        //     ton_proof: {
        //       account: wallet.account,
        //       ton_proof: wallet.connectItems.tonProof.proof,
        //     },
        //   });
        // }
    });
};
