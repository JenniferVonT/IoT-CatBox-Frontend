# IoT CatBox — Frontend

The frontend application for **IoT CatBox**, an IoT monitoring system that collects and visualizes temperature and humidity data from a cat litter box.

The application provides both **real-time sensor data** through MQTT and **historical persistent data** through a custom REST API.

## Features

* 📊 Real-time temperature and humidity visualization
* 📡 MQTT subscription for live sensor updates
* 🗄️ Historical telemetry data retrieved from a custom backend API
* 📅 Date-range filtering for historical data
* 🔄 Real-time/historical data toggle
* 📈 Interactive charts using Chart.js
* 🌡️ Temperature monitoring
* 💧 Humidity monitoring
* 📋 Telemetry summary statistics
* 📱 Responsive user interface

## Technologies

* **React** — UI library
* **JavaScript** — Application language
* **Vite** — Development server and build tool
* **Chart.js** — Data visualization
* **MQTT** — MQTT client for real-time sensor data
* **REST API** — Communication with the custom backend
* **Netlify** — Frontend deployment

## Architecture

The frontend receives data through two separate channels:

```text
                         IoT CatBox
                             │
                             │ Sensor data
                             ▼
                       MQTT Broker
                             │
                             │ MQTT / WebSocket
                             ▼
                    ┌─────────────────┐
                    │                 │
                    │    Frontend     │
                    │  React + Vite   │
                    │                 │
                    └────────┬────────┘
                             │
                             │ REST API
                             ▼
                    ┌─────────────────┐
                    │ Custom Backend  │
                    │                 │
                    └────────┬────────┘
                             │
                             ▼
                         MongoDB Atlas
```

### Real-time data

The frontend connects directly to the MQTT broker using MQTT over WebSockets.

When a new sensor reading is published, the frontend receives the message as a subscriber and the application updates the relevant charts immediately.

```text
MQTT Broker
    │
    │ New telemetry
    ▼
frontend MQTT client
    │
    ▼
LineChart
```

When real-time mode is enabled, incoming MQTT readings are appended to the existing historical data displayed in the chart.

Duplicate readings are ignored based on their timestamp.

When a user selects a custom date range, real-time updates for that chart are disabled so that incoming MQTT readings do not alter the selected historical view.

The real-time mode can be restored using the **Reset** button.

### Historical data

Historical telemetry is retrieved from the custom backend through REST API requests.

```text
Frontend
    │
    │ GET /telemetry/history
    ▼
Custom Backend
    │
    ▼
MongoDB
    │
    ▼
Historical telemetry
    │
    ▼
Frontend charts
```

The history endpoint supports:

```text
GET /telemetry/history?limit=500
```

and optional date filtering:

```text
GET /telemetry/history?limit=500&start=<ISO timestamp>&end=<ISO timestamp>
```

The frontend converts the user's local date/time selection to an ISO 8601 UTC timestamp before sending the request.

## Requirements

To run the frontend locally, you need:

* Node.js
* npm
* Access to the MQTT broker (an option is to run a container locally through Docker)
* Access to the IoT CatBox backend API

## Installation

Clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd IoT-CatBox-Frontend
npm install
```

## Environment Variables

The application uses Vite environment variables for configuration.

Create a `.env` file in the project root:

```env
VITE_APP_TITLE=IoT CatBox

VITE_API_BASE_URL=https://your-backend-url
VITE_API_KEY=your-api-key

VITE_MQTT_BROKER_URL=wss://your-mqtt-broker:8884/mqtt
VITE_MQTT_TOPIC=your/mqtt/topic
VITE_MQTT_USERNAME=your-mqtt-username
VITE_MQTT_PASSWORD=your-mqtt-password
```


## Development

Start the Vite development server:

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:5173
```

## Production Build

Create a production build:

```bash
npm run build
```

The compiled application will be generated in the `dist/` directory.

To preview the production build locally:

```bash
npm run preview
```

## Data Handling

### Timestamps

Telemetry timestamps are handled using UTC internally and converted to local time when displayed in the user interface.

The frontend:

1. Receives timestamps from the backend/MQTT broker.
2. Normalizes MQTT Unix timestamps to ISO 8601 timestamps.
3. Uses UTC timestamps for API requests and comparisons.
4. Converts timestamps to `Europe/Stockholm` when displaying them to the user.

This keeps timestamp handling consistent between the MQTT broker, backend, database, and frontend.

## MQTT

The frontend uses [mqtt.js](./src/lib/mqtt.js) to connect to the MQTT broker.

Because the application runs in a web browser, the broker must provide a WebSocket endpoint.

For an HTTPS deployment, the connection should use secure WebSockets:

```text
wss://your-mqtt-broker:8884/mqtt
```

rather than:

```text
ws://your-mqtt-broker:1883
```

The application subscribes to the configured MQTT topic and parses incoming JSON telemetry messages.

Expected MQTT data includes values such as:

```json
{
  "timestamp": 1724000000,
  "temperature": 22.5,
  "humidity": 45.2,
  "device": "pico-wh"
}
```

## Deployment

The frontend can be deployed to Netlify.

Recommended Netlify build settings:

| Setting           | Value           |
| ----------------- | --------------- |
| Framework preset  | `Vite`          |
| Build command     | `npm run build` |
| Publish directory | `dist`          |
| Base directory    | Leave empty     |
| Package directory | Leave empty     |

Production environment variables should be configured in Netlify's project settings.

After changing environment variables, a new deployment is required because Vite injects `VITE_*` variables during the build process.

## License

This project is licensed under the MIT License.
