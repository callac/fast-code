import { Http } from 'extensions/http'

export default class Feedback {
  static getList({ offset = 0, limit = 10, keyword = '' }) {
    return Http.get('/user/ticket', { offset, limit, keyword })
  }

  static getDetail(id) {
    return Http.get(`/user/ticket/${id}`)
      .then(res => ({
        ...res.ticket,
        ...res,
        id: res.ticket.ID,
      }))
  }

  static create({ phone = '', email = '', subject = '', body = '', attach = '' }) {
    // if (!phone && !email) return Promise.reject(new Error('feedback.submit.error-tip'))
    return Http.postForm('/user/ticket', { phone, email, subject, body, attach })
  }

  static reply({ ticket_id, message = '', attach = '' }) {
    return Http.postForm('/user/ticket/message', { ticket_id, message, attach })
  }
}
