import React, { useState } from "react";
import { WithContext as ReactTags } from "react-tag-input";
import { useRootStore } from "~/shared/stores/root";

// English comment: no extra Tag interface, just cast to any
export const HashtagInput = () => {
  const { hashtags, setHashtags } = useRootStore();

  // English comment: local state as string[] for simplicity
  const [tags, setTags] = useState<string[]>(hashtags);

  const KeyCodes = { comma: 188, enter: 13 };
  const delimiters = [KeyCodes.comma, KeyCodes.enter];

  const handleDelete = (i: number) => {
    const newTags = tags.filter((_, index) => index !== i);
    setTags(newTags);
    setHashtags(newTags);
  };

  // English comment: pass "any" to the function
  const handleAddition = (newTag: any) => {
    // English comment: newTag might be { id, text, ... } from react-tag-input
    const updatedTags = [...tags, newTag?.text || newTag?.id || ""];
    setTags(updatedTags);
    setHashtags(updatedTags);
  };

  return (
    <ReactTags
      tags={tags.map((t) => ({ id: t, text: t })) as any}
      delimiters={delimiters as any}
      handleDelete={handleDelete as any}
      handleAddition={handleAddition as any}
      allowDragDrop={false}
      placeholder="[ enter a hashtag ]"
    />
  );
};
