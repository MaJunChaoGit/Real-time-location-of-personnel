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

export const getDeviceType = function() {
  if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) { // 判断iPhone|iPad|iPod|iOS
    return 'ios';
  } else if (/(Android)/i.test(navigator.userAgent)) { // 判断Android
    return 'and';
  } else {
    return 'else';
  }
};
