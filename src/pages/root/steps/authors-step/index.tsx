import { useHapticFeedback } from "@vkruglikov/react-telegram-web-app";

import { Input } from "~/shared/ui/input";
import { FormLabel } from "~/shared/ui/form-label";
import { XMark } from "~/shared/ui/icons/x-mark.tsx";
import { Button } from "~/shared/ui/button";
import { useRootStore } from "~/shared/stores/root";
import { BackButton } from "~/shared/ui/back-button";

type AuthorsStepProps = {
  prevStep(): void;
  nextStep(): void;
};

export const AuthorsStep = ({ nextStep, prevStep }: AuthorsStepProps) => {
  const [impactOccurred] = useHapticFeedback();

  const { authors, setAuthors } = useRootStore();

  const handleAdd = () => {
    impactOccurred("light");
    setAuthors([...authors, ""]);
  };

  const handleRemove = (index: number) => {
    impactOccurred("light");

    const newAuthors = authors.filter((_, i) => i !== index);
    setAuthors(newAuthors);
  };

  const handleChange = (index: number, value: string) => {
    const newAuthors = authors.map((member, i) =>
      i === index ? value : member,
    );

    setAuthors(newAuthors);
  };

  return (
    <section className={"mt-4 px-4 pb-8"}>
      <BackButton onClick={prevStep} />

      <div className={"mb-[30px] flex flex-col text-sm"}>
        <span className={"ml-4"}>/Заполните информацию об авторах</span>
        <div>
          2/<span className={"text-[#7B7B7B]"}>5</span>
        </div>
      </div>

      <section className={"flex flex-col gap-1.5"}>
        {authors.map((member, index) => (
          <FormLabel
            key={index}
            labelClassName={"flex"}
            formLabelAddon={
              <button onClick={() => handleRemove(index)}>
                <XMark />
              </button>
            }
            label={`Автор_${index + 1}`}
          >
            <Input
              value={member}
              onChange={(e) => handleChange(index, e.target.value)}
              placeholder={"[ Введите_имя ]"}
            />
          </FormLabel>
        ))}
      </section>

      <button
        onClick={handleAdd}
        className={
          "mt-[30px] flex w-full items-center justify-center border border-white py-[8px] text-sm"
        }
      >
        Добавить_автора
      </button>

      <Button
        label={"Готово"}
        className={"mt-[30px]"}
        includeArrows={true}
        onClick={nextStep}
      />
    </section>
  );
};
