export type QuickReply = {
  text: string;
  action: () => void;
};

let currentQuickReplies: string[] = [];

export const setQuickReplies = (replies: string[]) => {
  currentQuickReplies = replies;
};

export const getQuickReplies = (): string[] => {
  return currentQuickReplies;
};

export const clearQuickReplies = () => {
  currentQuickReplies = [];
};