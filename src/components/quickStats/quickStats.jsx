import './quickStats.css'

function QuickStats ({
  visits,
  maxTemp,
  minTemp,
  avgTemp,
  maxHumidity,
  minHumidity,
  avgHumidity
}) {
  return (
    <div className='quick-stats'>
      <h2>Stats</h2>

      <div className='quick-stats__visits'>
        <p className='quick-stats__visits-label'>Visits*</p>
        <p className='quick-stats__visits-value'>{visits}</p>
      </div>

      <div className='quick-stats__metrics'>

        <section className='quick-stats__section'>
          <h3>Temperature</h3>

          <p className='quick-stats__value'>
            <span className='quick-stats__value-label'>Max</span>
            <span className='quick-stats__value-number'>{maxTemp} °C</span>
          </p>

          <p className='quick-stats__value'>
            <span className='quick-stats__value-label'>Min</span>
            <span className='quick-stats__value-number'>{minTemp} °C</span>
          </p>

          <p className='quick-stats__value'>
            <span className='quick-stats__value-label'>Average</span>
            <span className='quick-stats__value-number'>{avgTemp} °C</span>
          </p>
        </section>

        <section className='quick-stats__section'>
          <h3>humidity</h3>

          <p className='quick-stats__value'>
            <span className='quick-stats__value-label'>Max</span>
            <span className='quick-stats__value-number'>{maxHumidity} %</span>
          </p>

          <p className='quick-stats__value'>
            <span className='quick-stats__value-label'>Min</span>
            <span className='quick-stats__value-number'>{minHumidity} %</span>
          </p>

          <p className='quick-stats__value'>
            <span className='quick-stats__value-label'>Average</span>
            <span className='quick-stats__value-number'>{avgHumidity} %</span>
          </p>
        </section>

        <i>* A visit is counted when the Humidity exceeds X% for more than X minutes. TO-DO: update</i>
      </div>
    </div>
  )
}

export default QuickStats