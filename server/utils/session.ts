import { auth } from './auth'

export const getUserSession = async (event: any) => {
    return await auth.api.getSession({
        headers: event.headers
    })
}

export const requireUserSession = async (event: any) => {
    const session = await getUserSession(event)

    if (!session) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized'
        })
    }

    return session
}
