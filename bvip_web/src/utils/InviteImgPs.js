// 邀请图片与邀请二维码的拼接
export function inviteImgPs(qrcode, bgImg, pos = { left: 0, top: 0, width: 200, height: 120 }) {
  if (!bgImg) return ''
  const canvas = document.createElement('canvas')
  if (!canvas.getContext) throw new Error('Your browser do not support canvas')
  canvas.width = 750
  canvas.height = 1334

  const inviteImg = document.createElement('img')
  inviteImg.setAttribute('crossorigin', 'anonymous')
  inviteImg.src = bgImg
  const qrcodeImg = document.createElement('img')
  qrcodeImg.src = qrcode

  const ctx = canvas.getContext('2d')

  return new Promise((res) => {
    inviteImg.onload = () => {
      ctx.drawImage(inviteImg, 0, 0, 750, 1334)
      ctx.drawImage(qrcodeImg, pos.left, pos.top, pos.width, pos.height)
      res(canvas.toDataURL('image/jpeg', 0.6))
    }
  })
}
