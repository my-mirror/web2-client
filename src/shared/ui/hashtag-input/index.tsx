import { useState } from "react";
import { WithContext as ReactTags, SEPARATORS } from "react-tag-input";
import { useRootStore } from "~/shared/stores/root";
// English comment: no extra Tag interface, just cast to any
export const HashtagInput = () => {
  const { hashtags, setHashtags } = useRootStore();

  // English comment: local state as string[] for simplicity
  const [tags, setTags] = useState<string[]>(hashtags);

  const separators = [SEPARATORS.ENTER, SEPARATORS.COMMA]
  const handleDelete = (i: number) => {
    const newTags = tags.filter((_, index) => index !== i);
    setTags(newTags);
    setHashtags(newTags);
  };

  // English comment: pass "any" to the function
  const handleAddition = (newTag: any) => {
    // Clean up text from commas and trim whitespace
    const text = newTag?.text || newTag?.id || "";
    const cleanText = text.replace(/,/g, '').trim();
    
    // Skip empty tags
    if (!cleanText) return;
    
    const updatedTags = [...tags, cleanText];
    setTags(updatedTags);
    setHashtags(updatedTags);
  };

   // Simulate Enter keypress for Android
   const enterEvent = new KeyboardEvent('keydown', {
    key: 'Enter',
    code: 'Enter',
    bubbles: true,
    cancelable: true,
    which: 13,
    keyCode: 13,
  });
  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Unidentified') {
      const lastChar = e.currentTarget.value.slice(-1);
      if (lastChar === ',') {
        e.currentTarget.dispatchEvent(enterEvent);
      }
    }
  };
  
  return (
    <ReactTags
      tags={tags.map((t) => ({ id: t, text: t })) as any}
      separators={separators as any}
      handleDelete={handleDelete as any}
      handleAddition={handleAddition as any}
      allowDragDrop={false}
      placeholder="[ введите тэги через запятую ]"
      inputProps={{
        onKeyUp: handleKeyUp as any
      }}
    />
  );
};
