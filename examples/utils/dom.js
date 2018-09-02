export const getBreakPoints = function() {
  let clientWidth = document.body.clientWidth;

  let breakpoints =
  clientWidth >= 1920 ? 'xl'
    : clientWidth >= 1200 ? 'lg'
      : clientWidth >= 992 ? 'md'
        : clientWidth >= 768 ? 'sm' : 'xs';

  return breakpoints;
};

export const getClientWidth = function() {
  return document.body.clientWidth;
};
