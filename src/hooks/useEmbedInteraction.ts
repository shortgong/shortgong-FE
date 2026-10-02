export function useEmbedInteraction() {
  return {
    open: (_id: string) => {},
    close: () => {},
    isLive: (_id: string) => true,
  };
}
