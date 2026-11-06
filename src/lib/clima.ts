export type PrevisaoClima = {
  local: string
  data: string
  horario: string
  temperaturaMaxima: number
  temperaturaMinima: number
  icone: string
  descricao: string
}

type ResultadoGeocodificacao = {
  name?: string
  admin1?: string
  country?: string
  latitude?: number
  longitude?: number
}

type RespostaGeocodificacao = {
  results?: ResultadoGeocodificacao[]
}

type RespostaPrevisao = {
  daily?: {
    time?: string[]
    temperature_2m_max?: number[]
    temperature_2m_min?: number[]
    weather_code?: number[]
  }
}

function textoErro(resposta: Response, recurso: string) {
  return `${recurso}: ${resposta.status} ${resposta.statusText}`
}

async function lerJson<T>(resposta: Response, recurso: string): Promise<T> {
  if (!resposta.ok) throw new Error(textoErro(resposta, recurso))
  return resposta.json() as Promise<T>
}

function formatarLocal(resultado: ResultadoGeocodificacao) {
  return [resultado.name, resultado.admin1, resultado.country]
    .filter((parte, indice, partes): parte is string => Boolean(parte) && partes.indexOf(parte) === indice)
    .join(', ')
}

function interpretarCodigo(codigo: number) {
  if (codigo === 0) return { icone: '☀️', descricao: 'Céu limpo' }
  if ([1, 2].includes(codigo)) return { icone: '⛅', descricao: 'Parcialmente nublado' }
  if (codigo === 3) return { icone: '☁️', descricao: 'Nublado' }
  if ([45, 48].includes(codigo)) return { icone: '🌫️', descricao: 'Neblina' }
  if ([51, 53, 55, 56, 57].includes(codigo)) return { icone: '🌦️', descricao: 'Garoa' }
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(codigo)) return { icone: '🌧️', descricao: 'Chuva' }
  if ([71, 73, 75, 77, 85, 86].includes(codigo)) return { icone: '🌨️', descricao: 'Neve' }
  if ([95, 96, 99].includes(codigo)) return { icone: '⛈️', descricao: 'Tempestade' }
  return { icone: '🌤️', descricao: 'Condição não identificada' }
}

export async function consultarClima(local: string, data: string, horario: string): Promise<PrevisaoClima> {
  const geocodificacaoUrl = new URL('https://geocoding-api.open-meteo.com/v1/search')
  geocodificacaoUrl.search = new URLSearchParams({
    name: local,
    count: '1',
    language: 'pt',
    format: 'json',
  }).toString()

  const geocodificacao = await lerJson<RespostaGeocodificacao>(
    await fetch(geocodificacaoUrl),
    'Não foi possível localizar a região',
  )
  const resultado = geocodificacao.results?.[0]
  if (!resultado || typeof resultado.latitude !== 'number' || typeof resultado.longitude !== 'number') {
    throw new Error('Região não encontrada. Confira o nome informado e tente novamente.')
  }

  const previsaoUrl = new URL('https://api.open-meteo.com/v1/forecast')
  previsaoUrl.search = new URLSearchParams({
    latitude: String(resultado.latitude),
    longitude: String(resultado.longitude),
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    temperature_unit: 'celsius',
    timezone: 'auto',
    start_date: data,
    end_date: data,
  }).toString()

  const previsao = await lerJson<RespostaPrevisao>(
    await fetch(previsaoUrl),
    'Não foi possível consultar a previsão',
  )
  const diaria = previsao.daily
  const temperaturaMaxima = diaria?.temperature_2m_max?.[0]
  const temperaturaMinima = diaria?.temperature_2m_min?.[0]
  const codigo = diaria?.weather_code?.[0]
  if (
    !diaria?.time?.includes(data) ||
    typeof temperaturaMaxima !== 'number' ||
    typeof temperaturaMinima !== 'number' ||
    typeof codigo !== 'number'
  ) {
    throw new Error('Não há previsão disponível para a data selecionada.')
  }

  return {
    local: formatarLocal(resultado) || local,
    data,
    horario,
    temperaturaMaxima: Math.round(temperaturaMaxima),
    temperaturaMinima: Math.round(temperaturaMinima),
    ...interpretarCodigo(codigo),
  }
}
