import { useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'
import './lineChart.css'

function LineChart ({
  title,
  labels,
  values,
  borderColor,
  backgroundColor
}) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) {
      return
    }

    if (chartRef.current) {
      chartRef.current.destroy()
    }

    const data = {
      labels,
      datasets: [
        {
          label: title,
          data: values,
          borderColor,
          backgroundColor,
          fill: false,
          tension: 0.1,
          pointRadius: 0,
          pointHoverRadius: 4
        }
      ]
    }

    // --------------------------------------------------
    // Determine which x-axis indexes should be displayed
    // --------------------------------------------------

    const tickIndexes = new Set()

    // Always show the first point
    if (labels.length > 0) {
      tickIndexes.add(0)
    }

    // Add regular intervals.
    // This gives roughly 6 time labels across the graph.
    const interval = Math.max(1, Math.ceil(labels.length / 12))

    for (let i = 0; i < labels.length; i += interval) {
      tickIndexes.add(i)
    }

    // Add a tick whenever the date changes.
    labels.forEach((label, index) => {
      if (index === 0) {
        return
      }

      const currentDate = label.split(' ')[0]
      const previousDate = labels[index - 1].split(' ')[0]

      if (currentDate !== previousDate) {
        tickIndexes.add(index)
      }
    })

    // --------------------------------------------------
    // Y-axis padding
    // --------------------------------------------------

    const minValue = values.length
      ? Math.min(...values)
      : 0

    const maxValue = values.length
      ? Math.max(...values)
      : 0

    const config = {
      type: 'line',

      data,

      options: {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
          legend: {
            display: false
          }
        },

        scales: {
          // ------------------------------------------------
          // X axis
          // ------------------------------------------------
          x: {
            ticks: {
              color: '#e7e7e7',
              autoSkip: false,

              maxRotation: 35,
              minRotation: 35,

              padding: 8,

          callback: function (value, index) {
            if (!tickIndexes.has(index)) {
              return ''
            }

            const label = this.chart.data.labels[index]

            if (!label) {
              return ''
            }

            const [date, time] = label.split(' ')

            const previousLabel =
              index > 0
                ? this.chart.data.labels[index - 1]
                : null

            const previousDate =
              previousLabel?.split(' ')[0]

            // First point
            if (index === 0) {
              return ['', '', '', date]
            }

            // New date
            if (date !== previousDate) {
              return ['', '', '', date]
            }

            // Normal time
            return time?.slice(0, 5) || ''
          }
            },

            grid: {
              drawTicks: true,

              color: (context) => {
                return tickIndexes.has(context.index)
                  ? '#ffffff1f'
                  : 'transparent'
              }
            }
          },

          // ------------------------------------------------
          // Y axis
          // ------------------------------------------------

          y: {
            // Add some breathing room above and below
            // the actual minimum/maximum values.
            suggestedMin: minValue - 3,
            suggestedMax: maxValue + 3,

            ticks: {
              color: '#e7e7e7'
            },

            grid: {
              color: '#ffffff1f'
            }
          }
        }
      }
    }

    chartRef.current = new Chart(
      canvasRef.current,
      config
    )

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
        chartRef.current = null
      }
    }
  }, [
    backgroundColor,
    borderColor,
    labels,
    title,
    values
  ])

  return (
    <div className='metric-card'>
      <h2>{title}</h2>

      <div className='metric-card__chart'>
        <canvas ref={canvasRef} />
      </div>
    </div>
  )
}

export default LineChart