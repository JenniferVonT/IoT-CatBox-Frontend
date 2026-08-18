import { useState } from 'react'
import './toggleBar.css'

function ToggleBar ({
  title,
  earliestTimestamp,
  latestTimestamp,
  realTime,
  onChange
}) {
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  // Convert title into the metric name used by App
  const metric = title.toLowerCase()

  const handleRealTimeChange = (event) => {
    const checked = event.target.checked

    if (startTime || endTime) {
      return
    }

    onChange({
      metric,
      type: 'realtime',
      realTime: checked
    })
  }

  const handleStartTimeChange = (event) => {
    const value = event.target.value

    setStartTime(value)

    // Don't request until both values have been selected
    if (endTime) {
      onChange({
        metric,
        type: 'range',
        startTime: value,
        endTime
      })
    }
  }

  const handleEndTimeChange = (event) => {
    const value = event.target.value

    setEndTime(value)

    // Don't request until both values have been selected
    if (startTime) {
      onChange({
        metric,
        type: 'range',
        startTime,
        endTime: value
      })
    }
  }

  const handleReset = () => {
    setStartTime('')
    setEndTime('')

    onChange({
      metric,
      type: 'reset'
    })
  }

  return (
    <div className='toggle-bar'>
      <div className='toggle-bar__header'>
        <h3>{title}</h3>

        <label className='toggle'>
          <input
            type='checkbox'
            checked={realTime}
            onChange={handleRealTimeChange}
            disabled={Boolean(startTime || endTime)}
          />

          <span className='toggle__slider' />

          <span className='toggle__label'>
            Real-time
          </span>
        </label>
      </div>

      <div className='toggle-bar__range'>
        <label>
          From

          <input
            type='datetime-local'
            value={startTime}
            min={earliestTimestamp}
            max={endTime || latestTimestamp}
            onChange={handleStartTimeChange}
          />
        </label>

        <label>
          To

          <input
            type='datetime-local'
            value={endTime}
            min={startTime || earliestTimestamp}
            max={latestTimestamp}
            onChange={handleEndTimeChange}
          />
        </label>
      </div>

      <button
        type='button'
        className='toggle-bar__reset'
        onClick={handleReset}
      >
        Reset
      </button>
    </div>
  )
}

export default ToggleBar