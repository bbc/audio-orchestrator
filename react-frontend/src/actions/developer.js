/* eslint-disable-next-line import/prefer-default-export */
export const requestOpenDevTools = () => () => {
  if (window.openDevTools) {
    window.openDevTools();
  }
};
