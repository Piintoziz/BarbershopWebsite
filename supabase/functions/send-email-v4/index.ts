import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'npm:resend'
import { corsHeaders } from '../_shared/cors.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const ALLOWED_ORIGINS = ['http://localhost:8080', 'https://elite-barber.pt']
const MAX_REQUESTS_PER_MINUTE = 10

// Cache para rate limiting
const requestCache = new Map()

// Função para validar email
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Função para validar dados do email
const validateEmailData = (data: any) => {
  if (!data) throw new Error('Dados do email não fornecidos')
  if (!data.to || !isValidEmail(data.to)) throw new Error('Email do destinatário inválido')
  if (!data.subject) throw new Error('Assunto do email não fornecido')
  if (!data.html) throw new Error('Conteúdo do email não fornecido')
}

// Função para verificar rate limit
const checkRateLimit = (clientIp: string): boolean => {
  const now = Date.now()
  const minute = Math.floor(now / 60000)
  const cacheKey = `${clientIp}:${minute}`
  
  const currentRequests = requestCache.get(cacheKey) || 0
  if (currentRequests >= MAX_REQUESTS_PER_MINUTE) return false
  
  requestCache.set(cacheKey, currentRequests + 1)
  
  // Limpar cache antigo
  for (const [key] of requestCache) {
    const [, keyMinute] = key.split(':')
    if (parseInt(keyMinute) < minute) {
      requestCache.delete(key)
    }
  }
  
  return true
}

serve(async (req) => {
  try {
    // Verificar método
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    if (req.method !== 'POST') {
      throw new Error(`Método ${req.method} não permitido`)
    }

    // Verificar origem
    const origin = req.headers.get('origin')
    if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
      throw new Error('Origem não autorizada')
    }

    // Verificar rate limit
    const clientIp = req.headers.get('x-real-ip') || 'unknown'
    if (!checkRateLimit(clientIp)) {
      throw new Error('Limite de requisições excedido')
    }

    // Verificar API key
    if (!RESEND_API_KEY) {
      throw new Error('API key do Resend não configurada')
    }

    // Inicializar Resend
    const resend = new Resend(RESEND_API_KEY)

    // Obter e validar dados
    const data = await req.json()
    validateEmailData(data)

    // Enviar email
    const { error: sendError } = await resend.emails.send({
      from: 'STUDIO53 <no-reply@studio53.pt>',
      to: data.to,
      subject: data.subject,
      html: data.html,
      cc: data.cc,
      bcc: data.bcc
    })

    if (sendError) {
      console.error('Erro ao enviar email:', sendError)
      throw new Error('Falha ao enviar email')
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      }
    )

  } catch (error) {
    console.error('Erro na função de email:', error)
    
    return new Response(
      JSON.stringify({
        error: {
          message: error.message || 'Erro interno do servidor'
        }
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: error.message.includes('não autorizada') ? 403 
             : error.message.includes('Limite de requisições') ? 429 
             : 500
      }
    )
  }
}) 