import ReactPlayer from 'react-player/lazy';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';

import { Button } from '~/shared/ui/button';
import { usePurchaseContent, useViewContent } from '~/shared/services/content';
import { fromNanoTON } from '~/shared/utils';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AudioPlayer } from '~/shared/ui/audio-player';
import { useAuth } from '~/shared/services/auth';
import { CongratsModal } from './components/congrats-modal';
import { ErrorModal } from './components/error-modal';

type InvoiceStatus = 'paid' | 'failed' | 'cancelled' | 'pending';

// Add type for invoice event
interface InvoiceEvent {
    url: string;
    status: InvoiceStatus;
}

export const ViewContentPage = () => {
    const WebApp = useWebApp();

    const { data: content, refetch: refetchContent } = useViewContent(
        WebApp.initDataUnsafe?.start_param
    );

    const { mutateAsync: purchaseContent } = usePurchaseContent();

    const [tonConnectUI] = useTonConnectUI();

    const auth = useAuth();
    const [isCongratsModal, setIsCongratsModal] = useState(false);
    const [isErrorModal, setIsErrorModal] = useState(false);

    const handleBuyContentTON = useCallback(async () => {
        try {
            // Helper function to wait for wallet connection
            const waitForConnection = async (timeoutMs = 30000, intervalMs = 500) => {
                const startTime = Date.now();

                while (Date.now() - startTime < timeoutMs) {
                    if (tonConnectUI.connected) {
                        return true;
                    }
                    await new Promise((resolve) => setTimeout(resolve, intervalMs));
                }

                return false; // Timed out
            };

            // If not connected, start connection process
            if (!tonConnectUI.connected) {
                console.log('DEBUG: Wallet not connected, opening modal');

                // Open connection modal
                await tonConnectUI.openModal();

                // Wait for connection
                const connected = await waitForConnection();
                if (!connected) {
                    console.log('DEBUG: Connection timed out or was cancelled');
                    return;
                }

                console.log('DEBUG: Connection successful, authenticating');
                await auth.mutateAsync();
            } else {
                // Already connected, just authenticate
                await auth.mutateAsync();
            }

            // Proceed with purchase
            console.log('DEBUG: Proceeding with purchase');
            const contentResponse = await purchaseContent({
                content_address: WebApp.initDataUnsafe?.start_param,
                license_type: 'resale',
            });

            const transactionResponse = await tonConnectUI.sendTransaction({
                validUntil: Math.floor(Date.now() / 1000) + 86400, // 24 hours
                messages: [
                    {
                        amount: contentResponse.data.amount,
                        address: contentResponse.data.address,
                        payload: contentResponse.data.payload,
                    },
                ],
            });

            if (transactionResponse.boc) {
                void refetchContent();
                setIsCongratsModal(true);
                console.log(transactionResponse.boc, 'PURCHASED');
            } else {
                setIsErrorModal(true);
                console.error('Transaction failed:', transactionResponse);
            }
        } catch (error) {
            setIsErrorModal(true);
            console.error('Error handling Ton Connect subscription:', error);
        }
    }, [auth, purchaseContent, refetchContent, tonConnectUI, WebApp.initDataUnsafe?.start_param]);

    const handleBuyContentStars = useCallback(async () => {
        try {
            if (!content?.data?.invoice.url) {
                console.error('No invoice URL available');
                return;
            }

            // Add event listener for invoice closing with typed event
            const handleInvoiceClosed = (event: InvoiceEvent) => {
                if (event.url === content.data.invoice.url) {
                    if (event.status === 'paid') {
                        void refetchContent();
                        setIsCongratsModal(true);
                    } else if (event.status === 'failed' || event.status === 'cancelled') {
                        // setIsErrorModal(true); // Turn on if need in error modal. Update text in it to match both way of payment errors
                    }
                }
            };

            WebApp.onEvent('invoiceClosed', handleInvoiceClosed);

            await WebApp.openInvoice(content.data.invoice.url, (status: InvoiceStatus) => {
                console.log('Invoice status:', status);
                if (status === 'paid') {
                    void refetchContent();
                    setIsCongratsModal(true);
                } else if (status === 'failed' || status === 'cancelled') {
                    // setIsErrorModal(true); // Turn on if need in error modal. Update text in it to match both way of payment errors
                }
            });

            return () => {
                WebApp.offEvent('invoiceClosed', handleInvoiceClosed);
            };
        } catch (error) {
            console.error('Payment failed:', error);
            // setIsErrorModal(true); // Turn on if need in error modal. Update text in it to match both way of payment errors
        }
    }, [content, refetchContent]);

    const haveLicense = useMemo(() => {
        document.title = content?.data?.display_options?.metadata?.name;
        return (
            content?.data?.have_licenses?.includes('listen') ||
            content?.data?.have_licenses?.includes('resale')
        );
    }, [content]);

    useEffect(() => {
        const interval = setInterval(() => {
            void refetchContent();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const handleConfirmCongrats = () => {
        setIsCongratsModal(!isCongratsModal);
    };

    const handleErrorModal = () => {
        setIsErrorModal(!isErrorModal);
    };

    const handleDwnldContent = async () => {
        try {
            const fileUrl = content?.data?.display_options?.content_url;
            const fileName = content?.data?.display_options?.metadata?.name || 'content';
            const fileFormat = content?.data?.content_ext || '.raw';
            await WebApp.downloadFile({
                url: fileUrl,
                file_name: fileName + fileFormat,
            });
        } catch (error) {
            console.error('Error downloading content:', error);
        }
    };

    return (
        <main className={'min-h-screen flex w-full flex-col gap-[50px] px-4 '}>
            {isCongratsModal && <CongratsModal onConfirm={handleConfirmCongrats} />}
            {isErrorModal && <ErrorModal onConfirm={handleErrorModal} />}
            {content?.data?.content_type.startsWith('audio') &&
                content?.data?.display_options?.metadata?.image && (
                    <div className={'mt-[30px] h-[314px] w-full'}>
                        <img
                            alt={'content_image'}
                            className={'h-full w-full object-cover object-center'}
                            src={content?.data?.display_options?.metadata?.image}
                        />
                    </div>
                )}

            {content?.data?.content_type.startsWith('audio') ? (
                <AudioPlayer src={content?.data?.display_options?.content_url} />
            ) : (
                <ReactPlayer
                    playsinline={true}
                    controls={true}
                    width="100%"
                    config={{
                        file: {
                            attributes: {
                                playsInline: true,
                                autoPlay: true,
                                poster:
                                    content?.data?.display_options?.metadata?.image || undefined,
                            },
                        },
                    }}
                    url={content?.data?.display_options?.content_url}
                />
            )}

            <section className={'flex flex-col'}>
                <h1 className={'text-[20px] font-bold'}>
                    {content?.data?.display_options?.metadata?.name}
                </h1>
                {/*<h2>Russian</h2>*/}
                {/*<h2>2022</h2>*/}
                <p className={'mt-2 text-[12px]'}>
                    {content?.data?.display_options?.metadata?.description}
                </p>
            </section>

            <div className="mt-auto pb-2">
                {content?.data?.downloadable && (
                    <Button
                        onClick={() => handleDwnldContent()}
                        className={'h-[48px] bg-darkred mb-4'}
                        label={`Скачать контент`}
                    />
                )}
                {!haveLicense && (
                    <div className="flex flex-row gap-4">
                        <Button
                            onClick={handleBuyContentTON}
                            className={'mb-4 h-[48px] px-2'}
                            label={`Купить за ${fromNanoTON(content?.data?.encrypted?.license?.resale?.price)} ТОН`}
                            includeArrows={content?.data?.invoice ? false : true}
                        />
                        {content?.data?.invoice && (
                            <Button
                                onClick={handleBuyContentStars}
                                className={'mb-4 h-[48px] px-2'}
                                label={`Купить за ${content?.data?.invoice?.amount} ⭐️`}
                            />
                        )}
                    </div>
                )}
                <Button
                    onClick={() => {
                        WebApp.openTelegramLink(`https://t.me/MY_UploaderRobot`);
                    }}
                    className={'h-[48px] bg-darkred'}
                    label={`Загрузить свой контент`}
                />
                {tonConnectUI.connected && (
                    <Button
                        onClick={() => {
                            tonConnectUI.disconnect();
                        }}
                        className={'h-[48px] bg-darkred mt-4'}
                        label={`Отключить кошелек`}
                    />
                )}
            </div>
        </main>
    );
};
