# mock_api_server.py

from flask import Flask, jsonify, request
from datetime import datetime, timedelta
import random
import time

app = Flask(__name__)

# --- Configuration ---
# Define your sensor IDs and their locations
SENSOR_CONFIG = [
    {"sensorId": "WH-TEMP-001", "location": "Warehouse Zone A"},
    {"sensorId": "WH-HUM-002", "location": "Loading Dock"},
    {"sensorId": "WH-FRZ-003", "location": "Freezer Unit 1"},
    {"sensorId": "WH-DRY-004", "location": "Dry Storage"},
    {"sensorId": "WH-OFF-005", "location": "Office Area"},
]

# Initial values for temperature and humidity (will fluctuate)
INITIAL_TEMPERATURE = {
    "WH-TEMP-001": 22.0,
    "WH-HUM-002": 28.0,
    "WH-FRZ-003": -18.0, # Freezer unit
    "WH-DRY-004": 25.0,
    "WH-OFF-005": 20.0,
}

INITIAL_HUMIDITY = {
    "WH-TEMP-001": 55.0,
    "WH-HUM-002": 70.0,
    "WH-FRZ-003": 90.0, # High humidity in freezer
    "WH-DRY-004": 40.0,
    "WH-OFF-005": 50.0,
}

# How much temperature/humidity can change per "reading"
TEMP_FLUCTUATION = 0.5
HUM_FLUCTUATION = 2.0

# Store the current state of sensor values to simulate continuous change
current_sensor_values = {}

# Initialize current sensor values
for sensor in SENSOR_CONFIG:
    sensor_id = sensor["sensorId"]
    current_sensor_values[sensor_id] = {
        "temperature_celsius": INITIAL_TEMPERATURE.get(sensor_id, 20.0),
        "humidity_percent": INITIAL_HUMIDITY.get(sensor_id, 50.0),
    }

# --- Helper Function to Generate Data ---
def generate_latest_readings():
    """Generates a list of mock sensor readings."""
    readings = []
    now = datetime.utcnow()

    for sensor in SENSOR_CONFIG:
        sensor_id = sensor["sensorId"]
        location = sensor["location"]

        # Simulate slight fluctuations
        current_temp = current_sensor_values[sensor_id]["temperature_celsius"]
        current_hum = current_sensor_values[sensor_id]["humidity_percent"]

        new_temp = current_temp + random.uniform(-TEMP_FLUCTUATION, TEMP_FLUCTUATION)
        new_hum = current_hum + random.uniform(-HUM_FLUCTUATION, HUM_FLUCTUATION)

        # Keep values within reasonable bounds
        if "FRZ" in sensor_id: # Specific bounds for freezer
            new_temp = max(-25.0, min(-10.0, new_temp))
            new_hum = max(80.0, min(100.0, new_hum))
        else: # General bounds for other sensors
            new_temp = max(15.0, min(35.0, new_temp))
            new_hum = max(30.0, min(80.0, new_hum))

        current_sensor_values[sensor_id]["temperature_celsius"] = new_temp
        current_sensor_values[sensor_id]["humidity_percent"] = new_hum

        readings.append({
            "sensorId": sensor_id,
            "location": location,
            "timestamp": now.isoformat() + "Z", # ISO 8601 format with 'Z' for UTC
            "temperature_celsius": round(new_temp, 1),
            "humidity_percent": round(new_hum, 1),
        })
    return readings

# --- API Endpoint ---
@app.route('/latest-readings', methods=['GET'])
def latest_readings():
    """
    Returns the latest mock sensor readings.
    This endpoint mimics the structure of the hypothetical API.
    """
    data = generate_latest_readings()
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Serving data for {len(data)} sensors.")
    # Add CORS headers to allow requests from any origin (for local testing)
    response = jsonify(data)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

# --- Main execution ---
if __name__ == '__main__':
    print("Starting mock API server...")
    print("Access data at: http://127.0.0.1:5000/latest-readings")
    print("Press Ctrl+C to stop the server.")
    # Run the Flask app
    app.run(debug=True, port=5000) # debug=True allows auto-reloading on code changes
