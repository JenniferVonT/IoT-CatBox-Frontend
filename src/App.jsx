import { useEffect, useState } from 'react'
import Cat from './components/cat/cat.jsx'
import LineChart from './components/chart/lineChart.jsx'
import QuickStats from './components/quickStats/quickStats.jsx'
import ToggleBar from './components/togglebar/toggleBar.jsx'
import mqttClient from './lib/mqtt.js'
import api from './lib/api.js'
import {
  formatTimestamp,
  localDateTimeToISOString,
  formatDateTimeLocal
} from './lib/date.js'

function App () {
  const appTitle = import.meta.env.VITE_APP_TITLE

  const [mqttConnected, setMqttConnected] = useState(false)
  const [latestReading, setLatestReading] = useState(null)

  const [summary, setSummary] = useState(null)
  const [tempHistory, setTempHistory] = useState(null)
  const [humidHistory, setHumidHistory] = useState(null)

  const [earliestTimestamp, setEarliestTimestamp] = useState(null)
  const [latestTimestamp, setLatestTimestamp] = useState(null)

  // Real-time state for each chart independently
  const [temperatureRealtime, setTemperatureRealtime] = useState(true)
  const [humidityRealtime, setHumidityRealtime] = useState(true)

  // --------------------------------------------------
  // Fetch historical telemetry data and summary
  // --------------------------------------------------

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.getTelemetryHistory()
        const summary = await api.getTelemetrySummary()

        setTempHistory(response.history)
        setHumidHistory(response.history)

        setEarliestTimestamp(
          formatDateTimeLocal(response.earliestTimestamp)
        )

        setLatestTimestamp(
          formatDateTimeLocal(response.latestTimestamp)
        )

        summary.avgTemp = parseFloat(summary.avgTemp.toFixed(2))
        summary.avgHumidity = parseFloat(summary.avgHumidity.toFixed(2))

        setSummary(summary)
      } catch (error) {
        console.error('Failed to fetch telemetry history:', error)
      }
    }

    fetchHistory()
  }, [])


  // --------------------------------------------------
  // MQTT
  // --------------------------------------------------

  useEffect(() => {
    mqttClient.connect({
      onMessage: (data) => {
        setLatestReading(data)
      },
      onConnectionChange: (connected) => {
        setMqttConnected(connected)
      }
    })

    return () => {
      mqttClient.disconnect()
    }
  }, [])

  // --------------------------------------------------
  // Add MQTT reading to chart history
  // --------------------------------------------------

  useEffect(() => {
    if (!latestReading) {
      return
    }

    // Temperature chart
    if (temperatureRealtime) {
      setTempHistory(currentHistory => {
        if (!currentHistory) {
          return currentHistory
        }

        const alreadyExists = currentHistory.some(
          entry => entry.timestamp === latestReading.timestamp
        )

        if (alreadyExists) {
          return currentHistory
        }

        return [
          ...currentHistory,
          latestReading
        ]
      })
    }

    // Humidity chart
    if (humidityRealtime) {
      setHumidHistory(currentHistory => {
        if (!currentHistory) {
          return currentHistory
        }

        const alreadyExists = currentHistory.some(
          entry => entry.timestamp === latestReading.timestamp
        )

        if (alreadyExists) {
          return currentHistory
        }

        return [
          ...currentHistory,
          latestReading
        ]
      })
    }
  }, [
    latestReading,
    temperatureRealtime,
    humidityRealtime
  ])

  // --------------------------------------------------
  // Chart data
  // --------------------------------------------------

    const humidityLabels =
      humidHistory?.map(entry => formatTimestamp(entry.timestamp)) || []

    const humidityValues =
      humidHistory?.map(entry => entry.humidity) || []

    const temperatureLabels =
      tempHistory?.map(entry => formatTimestamp(entry.timestamp)) || []

    const temperatureValues =
      tempHistory?.map(entry => entry.temperature) || []

  // --------------------------------------------------
  // Toggle handling
  // --------------------------------------------------

  const handleDateToggleChange = async (event) => {
    const {
      metric,
      type,
      realTime,
      startTime,
      endTime
    } = event

    // --------------------------------------------------
    // Real-time toggle
    // --------------------------------------------------

    if (type === 'realtime') {
      if (metric === 'humidity') {
        setHumidityRealtime(realTime)
      }

      if (metric === 'temperature') {
        setTemperatureRealtime(realTime)
      }

      return
    }

    // --------------------------------------------------
    // Date range
    // --------------------------------------------------

    if (type === 'range') {
      const start = localDateTimeToISOString(startTime)
      const end = localDateTimeToISOString(endTime)

      const response = await api.getTelemetryHistory({
        start,
        end
      })

      if (metric === 'humidity') {
        setHumidityRealtime(false)
        setHumidHistory(response.history)
      }

      if (metric === 'temperature') {
        setTemperatureRealtime(false)
        setTempHistory(response.history)
      }

      return
    }

    // --------------------------------------------------
    // Reset
    // --------------------------------------------------

    if (type === 'reset') {
      const response = await api.getTelemetryHistory()

      if (metric === 'humidity') {
        setHumidityRealtime(true)
        setHumidHistory(response.history)
      }

      if (metric === 'temperature') {
        setTemperatureRealtime(true)
        setTempHistory(response.history)
      }
    }
  }

  return (
    <main className='app'>
      <div className='container-h container' id='title'>
        <Cat />
        <h1>{appTitle}</h1>
      </div>

      <section className='container-h info-row'>
        <div id='description' className='container tint'>
          <h2>About CatBox</h2>

          <p>
            CatBox is an IoT system that monitors temperature and humidity using a
            Raspberry Pi Pico WH. Sensor data is transmitted via MQTT, stored by the
            backend, and visualized here in real time.
          </p>
        </div>

        <div id='quick-stats' className='container tint'>
          {summary && (
            <QuickStats
              visits={summary.visits}
              maxTemp={summary.maxTemp}
              minTemp={summary.minTemp}
              avgTemp={summary.avgTemp}
              maxHumidity={summary.maxHumidity}
              minHumidity={summary.minHumidity}
              avgHumidity={summary.avgHumidity}
            />
          )}
        </div>
      </section>

      <section className='container-h chart-row'>
        <div id='humidity' className='container container-v tint'>
          <LineChart
            title='Humidity (%)'
            labels={humidityLabels}
            values={humidityValues}
            borderColor='#4fc3f7'
            backgroundColor='#4fc3f733'
          />

          <ToggleBar
            title='Humidity'
            earliestTimestamp={earliestTimestamp}
            latestTimestamp={latestTimestamp}
            realTime={humidityRealtime}
            onChange={handleDateToggleChange}
          />
        </div>

        <div id='temperature' className='container container-v tint'>
          <LineChart
            title='Temperature (°C)'
            labels={temperatureLabels}
            values={temperatureValues}
            borderColor='#ff8a65'
            backgroundColor='#ff8a6533'
          />

          <ToggleBar
            title='Temperature'
            earliestTimestamp={earliestTimestamp}
            latestTimestamp={latestTimestamp}
            realTime={temperatureRealtime}
            onChange={handleDateToggleChange}
          />
        </div>
      </section>
    </main>
  )
}

export default App