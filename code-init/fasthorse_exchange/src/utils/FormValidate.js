export function validatePhoneNumber(phone) {
  return /^1[34578]\d{9}$/.test(phone)
}

export function validateSex(sex) {
  return /^(男|女|boy|girl)$/i.test(sex)
}

export function validateRealName(realName) {
  return realName ? /^[\u4e00-\u9fa5]{2,6}$/.test(realName.trim()) : true
}

export function validateUSCC(uscc) {
  return uscc ? /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/.test(uscc.trim()) : true
}

export function validateIdCard(idCard) {
  if (!/^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/.test(idCard)) {
    return false
  }
  if (idCard.length === 18) {
    const arrInt = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
    const arrCh = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
    let nTemp = 0
    let i
    for (i = 0; i < 17; i += 1) {
      nTemp += idCard.substr(i, 1) * arrInt[i]
    }
    const valNum = arrCh[nTemp % 11]
    return valNum === idCard.substr(17, 1)
  }
  return false
}

export function validateEmail(email) {
  return email ? /^[-!#$%&'*+/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/.test(email) : true
}

export function validatePassword(password) {
  return password ? /^(?=.*[0-9])(?=.*[a-zA-Z]).{6,16}$/.test(password) && password.indexOf(' ') <= -1 : true
}

export function validateVerifyCode(verifyCode) {
  return verifyCode ? /^\d{6}$/.test(verifyCode) : true
}

export function validateCaptcha(captcha) {
  return captcha ? /^[\da-zA-Z]{4}$/.test(captcha) : true
}

export function validatePostCode(postCode) {
  return postCode ? /^[1-9][0-9]{5}$/.test(postCode) : true
}

export function validateUrl(url) {
  return url ? /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-.,@?^=%&:/~+#]*[\w\-@?^=%&/~+#])?/.test(url) : true
}

export function validateMoney(money) {
  return money ? /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/.test(money) : true
}

export function validateCreditCard(value) {
  if (/[^0-9-\s]+/.test(value)) {
    return true
  }

  let nCheck = 0
  let bEven = false
  const val = value.replace(/\D/g, '')

  for (let n = val.length - 1; n >= 0; n -= 1) {
    const cDigit = val.charAt(n)
    let nDigit = parseInt(cDigit, 10)

    if (bEven) {
      nDigit *= 2
      if (nDigit > 9) nDigit -= 9
    }

    nCheck += nDigit
    bEven = !bEven
  }

  return (nCheck % 10) === 0
}

export function validateChineseLength(title) {
  return title ? /^[\u4e00-\u9fa5]{1,10}$/.test(title) : true
}

export function validatePositiveInteger(title) {
  return title ? /^[0-9]*$/.test(title) : true
}

export function validateDatetime(val) {
  try {
    return /^[12][90]\d{2}-[01]\d-[0123]\d\s[01]\d:[0-6]\d:[0-6]\d$/.test(val) && !!new Date(val).getTime()
  } catch (e) {
    return false
  }
}

export function validateDate(val) {
  try {
    return /^[12][90]\d{2}-[01]\d-[0123]\d$/.test(val) && !!new Date(val).getTime()
  } catch (e) {
    return false
  }
}

// 检验备注 20字以内不含特殊符号的
export function validateRemark(val) {
  try {
    /* eslint-disable */
    const regEn = /[`~!@#$%^&*()_+<>?:"{},.\/;'[\]]/im;
    const regCn = /[·！#￥（——）：；“”‘、，|《。》？、【】[\]]/im;
    if (regEn.test(val) || regCn.test(val)) {
      return false;
    } if (val.length > 20) {
      return false;
    }
    return true;
  } catch (e) {
    return false
  }
}

// 检验ip
export function validateIp(val) {
  const ips = String(val).split(',')
  if (ips.length > 0) {
    let isIp = true
    const reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
    ips.forEach((ip) => {
      if (!reg.test(ip)) {
        isIp = false
      }
    })
    return isIp
  }
  return false
}
