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

export const dateFtt = function(fmt, date) {
  var o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
    'q+': Math.floor((date.getMonth() + 3) / 3),
    'S': date.getMilliseconds()
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
  }
  return fmt;
};

export const crtTimeFtt = function(value) {
  var crtTime = new Date(value);
  return dateFtt('yyyy-MM-dd hh:mm:ss', crtTime);
};
