import { defineEventHandler, getQuery, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  
  const { input, types, sessionToken } = query
  
  if (!input || typeof input !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'Input parameter is required'
    })
  }
  
  const apiKey = config.googleMapsApiKey
  
  if (!apiKey) {
    throw createError({
      statusCode: 500,
      message: 'Google Maps API key is not configured'
    })
  }
  
  try {
    const params = new URLSearchParams({
      input: input,
      key: apiKey,
      types: (types as string) || '(cities)',
    })
    
    // Add session token if provided (for billing optimization)
    if (sessionToken && typeof sessionToken === 'string') {
      params.append('sessiontoken', sessionToken)
    }
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`
    )
    
    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        message: 'Failed to fetch places from Google API'
      })
    }
    
    const data = await response.json()
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error:', data.status, data.error_message)
      throw createError({
        statusCode: 500,
        message: data.error_message || `Google Places API error: ${data.status}`
      })
    }
    
    return {
      predictions: data.predictions || []
    }
  } catch (error: any) {
    // Re-throw if it's already an H3 error
    if (error.statusCode) {
      throw error
    }
    
    console.error('Places autocomplete error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to search places'
    })
  }
})
