
## 🌱 Smart Garden Dashboard

An IoT-enabled smart irrigation and monitoring system designed to support sustainable urban gardening.
This project combines real-time sensor monitoring, automated irrigation control, and a modern web interface using Next.js, Supabase, and MQTT.

The system is aligned with smart city concepts and SDG 11 (Sustainable Cities and Communities) by promoting efficient water usage and intelligent environmental management.



## ✨ Key Features

- **Live Dashboard:** Visualize temperature, humidity, soil moisture, and weather data from IoT sensors.
- **Manual & Auto Control:** Switch between automatic and manual pump control for irrigation.
- **Calibration:** Adjust sensor thresholds and calibration settings for optimal plant care.
- **Realtime Updates:** Data is fetched live from Supabase and device commands are sent via MQTT.
- **Modern UI:** Responsive, sidebar-driven layout with Lucide icons and Recharts for data visualization.

## 🛠 Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [Supabase](https://supabase.com/) (PostgreSQL backend)
- [MQTT.js](https://github.com/mqttjs/MQTT.js) (IoT messaging)
- [Recharts](https://recharts.org/) (Charts)
- [Tailwind CSS](https://tailwindcss.com/) (Styling)

## 🚀 Getting Started

1. **Install dependencies:**
	```bash
	npm install
	# or
	yarn install
	```

2. **Set up environment variables:**
	- Create a `.env.local` file in the root directory.
	- Add your Supabase project URL and anon key:
	  ```env
	  NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
	  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
	  ```

3. **Run the development server:**
	```bash
	npm run dev
	# or
	yarn dev
	```
	Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

app/
 ├─ dashboard/        # Live monitoring dashboard
 ├─ calibration/      # Sensor calibration interface
 ├─ manual-control/   # Manual pump override
 ├─ api/pump/         # MQTT backend bridge
 └─ layout.jsx        # App layout & sidebar

components/
 └─ Sidebar.jsx       # Sidebar navigation

lib/
 └─ supabase.js       # Supabase client setup

## Key Pages

- **Dashboard:** `/dashboard` — Live sensor data and charts
- **Calibration:** `/calibration` — Adjust sensor thresholds
- **Manual Control:** `/manual-control` — Directly control irrigation pump

## API & IoT Integration

- **Supabase:** Stores and retrieves sensor data
- **MQTT:** Sends pump control commands to ESP32/IoT device via `/api/pump`

## ⚙ Customization

- Update MQTT broker address in `app/api/pump/route.js` if needed.
- Adjust Supabase table/column names in `lib/supabase.js` and dashboard code as per your schema.

## 📜 License

MIT — see [LICENSE](LICENSE) for details.
