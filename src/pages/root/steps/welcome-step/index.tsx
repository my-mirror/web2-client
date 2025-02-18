import { useEffect, useState } from "react";
import { useTonConnectUI } from "@tonconnect/ui-react";

import { Button } from "~/shared/ui/button";
import { useAuth } from "~/shared/services/auth";
import { Address } from "@ton/core";

type WelcomeStepProps = {
  nextStep(): void;
};

export const WelcomeStep = ({ nextStep }: WelcomeStepProps) => {
  const [tonConnectUI] = useTonConnectUI();
  const [isLoaded, setLoaded] = useState(false);
  const [isConnected, setIsConnected] = useState(tonConnectUI.connected);
  const [address, setAddress] = useState('');
  console.log("💩💩💩 enter WelcomeStep");

  const auth = useAuth();

  console.log("💩💩💩 after useAuth");
  
  useEffect(() => {
    localStorage.setItem('disclaimerAccepted', 'false');
  }, []);

  useEffect(() => {
    const unsubscribe = tonConnectUI.onStatusChange((wallet) => {
      setIsConnected(!!wallet);
    });

    return () => {
      unsubscribe();
    };
  }, [tonConnectUI]);

  useEffect(() => {
    if(tonConnectUI.account){
      setAddress(Address.parse(tonConnectUI.account?.address).toString({
        bounceable: false,
        urlSafe: true,
        testOnly: false,
      }),)
    }
  }, [tonConnectUI.account]);

  const handleNextClick = async () => {
    if (tonConnectUI.connected) {
      await auth.mutateAsync();
      nextStep();
    } else {
      try {
        await tonConnectUI.openModal();
        await auth.mutateAsync();
      } catch (error) {
        console.error('Failed to connect or authenticate:', error);
      }
    }
  };

  const handleDisconnect = async () => {
    if (isConnected){
      try {
        await tonConnectUI.disconnect();
      } catch (error) {
        console.error('Failed to disconnect:', error);
      }
    }
  }
  // useEffect(() => {
  //   const first = setTimeout(async () => {
  //     console.log("💩💩💩 call auth");
  //     await auth.mutateAsync();
  //   }, 1000);
  //
  //   const second = setTimeout(() => {
  //     setLoaded(true);
  //
  //     if (tonConnectUI.connected) {
  //       nextStep();
  //     }
  //   }, 4000);
  //
  //   return () => {
  //     clearTimeout(first);
  //     clearTimeout(second);
  //   };
  // }, [tonConnectUI.connected]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoaded(true)
    }, 5000);

    return () => {
      clearTimeout(timeout);
    }
  }, []);

  if (!isLoaded) {
    return (
      <section
        className={"relative flex h-[100vh] items-center justify-center"}
      >
        <img alt={"splash"} className={"mb-20 h-[400px]"} src={"/splash.gif"} />
      </section>
    );
  }

  return (
    <section className={"mt-4 flex flex-col justify-between min-h-[calc(100vh-32px)] px-4"}>
      <div className="flex items-center justify-center overflow-hidden w-[100%] h-[400px]">
        <img
          alt={"splash"}
          className={" w-full shrink-0"}
          src={"/splash.gif"}
        />
      </div>

      <div className={"flex flex-col mt-4"}>
        <div className={"flex gap-2 text-sm"}>
          <span>/ Добро пожаловать в MY</span>

          <div className={"flex items-center gap-0"}>
            <span>[</span>
            <div className={"mb-0.5 h-3 w-3 rounded-full bg-primary"} />
            <span>]:</span>
          </div>
        </div>

        
          {isConnected ?
            <>
              <div className={"mt-2"}>
                <p className={"text-sm"}>
                  Вы зарегистрированы под кошельком: <br/>
                  <span className={"font-bold"}>{address}</span>
                </p>
              </div>
              <div className="flex flex-col">
                  <Button
                    className={"mt-[30px]"}
                    label={"Продолжить"}
                    includeArrows={false}
                    isLoading={auth.isLoading}
                    onClick={handleNextClick}
                  />
                  <Button
                    className={"mt-[20px] bg-inherit"}
                    label={"Изменить кошелек"}
                    includeArrows={false}
                    isLoading={false}
                    onClick={handleDisconnect}
                  />
              </div>
            </>
          :
            <>
              <div className={"mt-2"}>
                <p className={"text-sm"}>
                  Здесь вы можете загрузить свой контент. <br/> Для продолжения подключите кошелек.
                </p>
              </div>
              <div className={"mt-2"}>
                <p className={"text-sm"}>
                  Не волнуйтесь. Вы сможете поменять свой выбор в любой момент.
                </p>
              </div>
              <Button
                className={"mt-[30px]"}
                label={"Подключить криптокошелёк TON"}
                includeArrows={true}
                isLoading={auth.isLoading}
                onClick={handleNextClick}
              />
            </>}
        
      </div>
    </section>
  );
};