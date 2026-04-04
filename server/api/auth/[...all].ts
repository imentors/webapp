import { auth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const request = toWebRequest(event)
  const response = await auth.handler(request)
  return response
})
