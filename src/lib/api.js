class ApiClient {
  constructor () {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL
    this.apiKey = import.meta.env.VITE_API_KEY
  }

  async request (path, options = {}) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        ...options.headers
      }
    })

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      )
    }

    return response.json()
  }

  async getApiInfo () {
    return this.request('/')
  }

  async getLatestTelemetry () {
    return this.request('/telemetry/latest')
  }

  async getTelemetryHistory ({
    limit = 500,
    start = null,
    end = null
  } = {}) {
    const params = new URLSearchParams({ limit })

    if (start) {
      params.append('start', start)
    }

    if (end) {
      params.append('end', end)
    }

    return this.request(`/telemetry/history?${params.toString()}`)
  }

  async getTelemetrySummary () {
    return this.request('/telemetry/summary')
  }
}

export default new ApiClient()