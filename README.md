# Smart Warehouse Environmental Dashboard

A dynamic, real-time web dashboard for monitoring environmental conditions (temperature and humidity) within a smart warehouse using IoT sensor data. The dashboard visualizes live data using D3.js line charts with a rolling window display.

---

## 🚀 Features

- **Real-time Data Fetching**  
  Continuously fetches the latest sensor readings from a specified REST API endpoint.

- **Dynamic Display**  
  Updates sensor ID, location, temperature, and humidity readings on the dashboard.

- **D3.js Live Charts**  
  Visualizes temperature over time for each sensor with a rolling window of the last 20 data points.

- **Interactive Tooltips**  
  Hover to see exact temperature and timestamp.

- **Responsive Design**  
  Styled with Tailwind CSS for a clean and mobile-friendly layout.

---

## 📁 Folder Structure

```
/your-dashboard-project/
├── index.html
├── dashboard.js
├── style.css          # (Optional, for additional custom styles)
├── mock_api_server.py # (Optional, for demo purpose)
└── server.js          # (Optional, for demo purpose)
```

---

## ⚙️ How to Use

### 1. Save Files

- Save the main HTML file as `index.html`.
- Save the JS logic as `dashboard.js` (in the same folder).
- (Optional) Save additional styling in `style.css`.

---

### 2. Serve via Local Server (Recommended)

To avoid CORS issues, serve the files using a local web server.

#### Option A: Python HTTP Server

```bash
# In the project directory
python -m http.server 8000
```

Access at: [http://localhost:8000](http://localhost:8000)

#### Option B: Node.js with Express

Create a `server.js`:

```javascript
const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
```

Then install and run:

```bash
npm install express
node server.js
```

Access at: [http://localhost:3000](http://localhost:3000)

---

### 3. View the Dashboard

Open your browser and visit the local server address. The dashboard will load and begin fetching live sensor data.

---

## 🛠️ Customization

All configurable options are in `dashboard.js`.

### 🔗 API Endpoint

Update the endpoint:

```js
const API_URL = 'https://api.mywarehousesensors.com/latest-readings';
```

### ⏱️ Polling Interval

Set the data refresh rate (in ms):

```js
const POLLING_INTERVAL_MS = 5000;  // Change to 10000 for 10s, etc.
```

### 📉 Chart Data Points (Rolling Window)

Control historical point count:

```js
const MAX_DATA_POINTS = 20;
```

### 📐 Chart Dimensions

Adjust chart size:

```js
const chartWidth = 450 - margin.left - margin.right;
const chartHeight = 250 - margin.top - margin.bottom;
```

### 📊 Y-Axis Padding

Avoid line chart edges:

```js
.domain([
  d3.min(data, d => d.temperature_celsius) - 2,
  d3.max(data, d => d.temperature_celsius) + 2
])
```

### 🎨 Styling

Use Tailwind utility classes or your own CSS in `style.css`.

---

## 🌦️ Adding More Charts (e.g., Humidity)

- Duplicate the chart rendering logic.
- Use `humidity_percent` instead of `temperature_celsius`.
- Update the y-axis and tooltip labels accordingly.
- Add a new `<svg>` container in HTML or dynamically via JS.

---

## 📦 Dependencies

- **D3.js**  
  For rendering live line charts (via CDN).

- **Tailwind CSS**  
  For responsive and elegant UI (via CDN).


---

### **How to Use This Mock API Server:**

- **Save the Script:** Save the code above into a file named mock_api_server.py in your project directory (e.g., your-dashboard-project/mock_api_server.py).

- **Install Flask:** If you don't have Flask installed, open your terminal or command prompt and run:

```Bash
pip install Flask
```
- **Run the Mock Server:** Navigate to your-dashboard-project directory in the terminal and run:


```bash
python mock_api_server.py
```

>You should see output indicating the server is running, usually on http://127.0.0.1:5000.

**Update dashboard.js:**
- Now, you need to tell your dashboard.js script to fetch data from this local server instead of the hypothetical external API.
- Open your dashboard.js file and change the API_URL constant from:

```JavaScript

const API_URL = 'https://api.mywarehousesensors.com/latest-readings';
```
to:

```JavaScript
const API_URL = 'http://127.0.0.1:5000/latest-readings'; // Point to your local mock API
```
**Run Your Dashboard:**
- With the mock_api_server.py running in one terminal, open another terminal (or use your existing one if the server is running in the background) and start your web server for index.html (e.g., python -m http.server 8000 or node server.js).

- Then, open your browser to http://localhost:8000 (or http://localhost:3000). Your dashboard should now fetch data from your local mock API and display it dynamically!

- This ```mock_api_server.py``` will generate slightly fluctuating temperature and humidity values for a few predefined sensors, giving you a live demo experience without needing actual IoT devices.

---

> 💡 Built for flexibility and extensibility — tailor the dashboard to your warehouse environment with ease!
