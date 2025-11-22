export {};

declare global {
  var process: {
    env: {
      API_KEY: string;
      [key: string]: string | undefined;
    };
  };
}
