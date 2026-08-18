import mqtt from 'mqtt'

class MqttClient {
  constructor () {
    this.client = null
    this.topic = import.meta.env.VITE_MQTT_TOPIC

    this.brokerUrl = import.meta.env.VITE_MQTT_BROKER_URL
    this.username = import.meta.env.VITE_MQTT_USERNAME
    this.password = import.meta.env.VITE_MQTT_PASSWORD

    this.onMessage = null
    this.onConnectionChange = null
  }

  connect ({ onMessage, onConnectionChange } = {}) {
    this.onMessage = onMessage
    this.onConnectionChange = onConnectionChange

    // Already connected/connecting
    if (this.client) {
      console.log('MQTT client already exists')
      return
    }

    console.log('Creating MQTT connection')

    const client = mqtt.connect(this.brokerUrl, {
      username: this.username,
      password: this.password,
      reconnectPeriod: 5000
    })

    this.client = client

    client.on('connect', () => {
      // Ignore events from an old client
      if (this.client !== client) {
        return
      }

      console.log('Connected to MQTT broker')

      this.onConnectionChange?.(true)

      client.subscribe(this.topic, (error) => {
        if (error) {
          console.error('MQTT subscription failed:', error)
          return
        }
      })
    })

    client.on('message', (topic, message) => {
      if (this.client !== client) {
        return
      }

      if (topic !== this.topic) {
        return
      }

      try {
        const data = JSON.parse(message.toString())
        const normalizedData = {
          ...data,
          timestamp: new Date(data.timestamp * 1000).toISOString()
        }

        this.onMessage?.(normalizedData)
      } catch (error) {
        console.error('Failed to parse MQTT message:', error)
      }
    })

    client.on('error', (error) => {
      if (this.client !== client) {
        return
      }

      console.error('MQTT error:', error)

      this.onConnectionChange?.(false)
    })

    client.on('close', () => {
      if (this.client !== client) {
        return
      }

      console.log('MQTT connection closed')

      this.onConnectionChange?.(false)
    })

    client.on('reconnect', () => {
      if (this.client !== client) {
        return
      }

      console.log('Attempting to reconnect to MQTT broker...')
    })
  }

  disconnect () {
    const client = this.client

    if (!client) {
      return
    }

    // Immediately invalidate this client.
    this.client = null

    // Remove our callbacks so the old client can't
    // update React after disconnect.
    this.onMessage = null
    this.onConnectionChange = null

    client.end(true)

    console.log('Disconnected from MQTT broker')
  }
}

export default new MqttClient()