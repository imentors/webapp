import OpenAI from 'openai'

const config = useRuntimeConfig()

export const openai = new OpenAI({
  apiKey: config.openaiApiKey,
})

// OpenAI models
export const CHAT_MODELS = [
  'gpt-4o-mini',
  'gpt-4o',
  'gpt-4-turbo',
  'gpt-3.5-turbo',
]

export const FREE_MODELS = {
  CHAT: CHAT_MODELS[0], // gpt-4o-mini is cost-effective
}

// Premium models for production
export const PREMIUM_MODELS = {
  CHAT: 'gpt-4o',
  CHAT_FAST: 'gpt-4o-mini',
  EMBEDDINGS: 'text-embedding-3-small',
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function chatCompletion(
  messages: ChatMessage[],
  model: string = FREE_MODELS.CHAT,
  options: {
    temperature?: number
    maxTokens?: number
    retries?: number
    useFreeFallbacks?: boolean
  } = {}
) {
  const maxRetries = Math.max(0, options.retries ?? 2)
  const backoffBaseMs = 500
  const modelsToTry = [model]
  if (options.useFreeFallbacks !== false) {
    for (const m of CHAT_MODELS) {
      if (!modelsToTry.includes(m)) modelsToTry.push(m)
    }
  }

  let lastError: any = null
  let attempt = 0
  for (const candidateModel of modelsToTry) {
    attempt = 0
    while (attempt <= maxRetries) {
      try {
        const response = await openai.chat.completions.create({
          model: candidateModel,
          messages,
          temperature: options.temperature ?? 0.6,
          max_tokens: options.maxTokens ?? 800,
        })

        return {
          content: response.choices[0]?.message?.content || '',
          usage: response.usage,
        }
      } catch (error: any) {
        lastError = error
        const status = error?.status || error?.statusCode || error?.response?.status
        const isRateLimited = status === 429 || /rate.?limit/i.test(String(error?.message))
        const isProviderBusy = status === 503

        // For rate limit / busy provider, retry with backoff and/or next model
        if ((isRateLimited || isProviderBusy) && attempt < maxRetries) {
          const delay = backoffBaseMs * Math.pow(2, attempt)
          await new Promise((r) => setTimeout(r, delay))
          attempt++
          continue
        }

        // If we got a non-retriable error, break to try next model
        break
      }
    }
  }

  console.error('[OpenAI] Chat completion error (final):', lastError)
  const status = lastError?.status || lastError?.statusCode || lastError?.response?.status
  if (status === 429) {
    throw createError({
      statusCode: 429,
      message: 'AI provider is rate limiting. Please try again in a few seconds.',
    })
  }
  if (status === 503) {
    throw createError({
      statusCode: 503,
      message: 'AI provider is temporarily unavailable. Please try again shortly.',
    })
  }
  throw createError({
    statusCode: 500,
    message: lastError?.message || 'AI service error',
  })
}
