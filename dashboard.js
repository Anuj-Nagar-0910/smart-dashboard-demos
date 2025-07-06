// dashboard.js

// Constants for API and chart configuration
//const API_URL = 'https://api.mywarehousesensors.com/latest-readings';
const API_URL = 'http://127.0.0.1:5000/latest-readings'; // Point to your local mock API
const POLLING_INTERVAL_MS = 5000; // 5 seconds
const MAX_DATA_POINTS = 20; // Keep last 20 data points for rolling chart

// Global object to store historical data for each sensor
// Structure: { sensorId: [{ timestamp, temperature_celsius, humidity_percent }, ...] }
const sensorDataHistory = {};

// D3 chart margins - Increased left margin for Y-axis labels
const margin = { top: 40, right: 40, bottom: 50, left: 70 }; // Increased left and right margins

// Note: chartWidth and chartHeight will now be calculated dynamically per chart instance
// based on the container's available space.

/**
 * Fetches the latest sensor data from the API.
 * Updates the global sensorDataHistory and triggers dashboard updates.
 */
async function fetchSensorData() {
    try {
        // Hide loading message once data starts coming in
        const loadingMessage = document.getElementById('loading-message');
        if (loadingMessage) {
            loadingMessage.classList.add('hidden');
        }

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const latestReadings = await response.json();
        console.log('Fetched data:', latestReadings);

        // Process each sensor reading
        latestReadings.forEach(reading => {
            const { sensorId, timestamp, temperature_celsius, humidity_percent } = reading;

            // Ensure sensorId exists in history, initialize if not
            if (!sensorDataHistory[sensorId]) {
                sensorDataHistory[sensorId] = [];
            }

            // Add new reading to history, keeping only the latest MAX_DATA_POINTS
            sensorDataHistory[sensorId].push({
                timestamp: new Date(timestamp), // Parse timestamp string to Date object
                temperature_celsius,
                humidity_percent
            });

            // Trim old data points to maintain rolling window
            if (sensorDataHistory[sensorId].length > MAX_DATA_POINTS) {
                sensorDataHistory[sensorId].shift(); // Remove the oldest data point
            }
        });

        // Update the dashboard with the new data
        updateDashboard(latestReadings);

    } catch (error) {
        console.error('Error fetching sensor data:', error);
        // Optionally display an error message on the dashboard
        const dashboardContainer = document.getElementById('dashboard-container');
        if (dashboardContainer && !document.getElementById('error-message')) {
            const errorMessage = document.createElement('div');
            errorMessage.id = 'error-message';
            errorMessage.className = 'col-span-full text-center text-red-500 text-lg p-4 bg-red-100 rounded-lg';
            errorMessage.textContent = 'Failed to load sensor data. Please check the API connection.';
            dashboardContainer.appendChild(errorMessage);
        }
    }
}

/**
 * Updates the HTML display for each sensor and triggers chart rendering.
 * @param {Array} latestReadings - The most recent data fetched from the API.
 */
function updateDashboard(latestReadings) {
    const dashboardContainer = document.getElementById('dashboard-container');

    latestReadings.forEach(reading => {
        const { sensorId, location, temperature_celsius, humidity_percent } = reading;
        const sensorChartId = `sensor-chart-${sensorId}`;
        let sensorDiv = document.getElementById(sensorChartId);

        // If the sensor's div doesn't exist, create it dynamically
        if (!sensorDiv) {
            sensorDiv = document.createElement('div');
            sensorDiv.id = sensorChartId;
            // Added flex-grow to allow charts to expand and fill space better
            sensorDiv.className = 'chart-container flex flex-col items-center p-6 bg-white rounded-xl shadow-lg flex-grow';
            dashboardContainer.appendChild(sensorDiv);
        }

        // Update sensor information display
        // Using data attributes for values to avoid re-rendering entire innerHTML
        // However, for simplicity and existing structure, we'll stick to innerHTML for now.
        // For a more performant update, one would directly update specific spans.
        sensorDiv.innerHTML = `
            <h2 class="text-xl font-semibold text-gray-800 mb-2">${sensorId}</h2>
            <p class="text-gray-600 text-sm mb-4">${location}</p>
            <div class="flex justify-around w-full mb-4">
                <p class="text-lg font-medium text-blue-600">Temp: <span class="temp-value">${temperature_celsius.toFixed(1)}°C</span></p>
                <p class="text-lg font-medium text-green-600">Humidity: <span class="humidity-value">${humidity_percent.toFixed(1)}%</span></p>
            </div>
            <div class="chart-svg-container w-full" id="svg-${sensorId}"></div>
        `;

        // Render/update the D3.js chart for this sensor
        renderChart(sensorId, sensorDataHistory[sensorId]);
    });
}

/**
 * Renders or updates a D3.js line chart for a specific sensor.
 * @param {string} sensorId - The ID of the sensor.
 * @param {Array} data - The historical data points for the sensor.
 */
function renderChart(sensorId, data) {
    const svgContainerId = `svg-${sensorId}`;
    const container = document.getElementById(svgContainerId);
    if (!container) return; // Ensure container exists

    // Calculate dynamic width based on parent container
    const containerWidth = container.offsetWidth;
    const chartWidth = containerWidth - margin.left - margin.right;
    const chartHeight = 250 - margin.top - margin.bottom; // Keeping height relatively fixed for consistency in this example

    // Clear existing SVG to prevent multiple charts on re-render
    d3.select(`#${svgContainerId}`).select('svg').remove();

    let svg = d3.select(`#${svgContainerId}`)
        .append('svg')
        .attr('width', chartWidth + margin.left + margin.right)
        .attr('height', chartHeight + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Define scales
    const xScale = d3.scaleTime()
        .domain(d3.extent(data, d => d.timestamp))
        .range([0, chartWidth]); // Use dynamic chartWidth

    const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.temperature_celsius) - 2, d3.max(data, d => d.temperature_celsius) + 2]) // Add padding to y-axis
        .range([chartHeight, 0]);

    // Define the line generator
    const line = d3.line()
        .x(d => xScale(d.timestamp))
        .y(d => yScale(d.temperature_celsius));

    // Add X-axis group
    svg.append('g')
        .attr('class', 'x-axis axis')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat('%H:%M:%S'))); // Format time as HH:MM:SS

    // Add Y-axis group
    svg.append('g')
        .attr('class', 'y-axis axis')
        .call(d3.axisLeft(yScale));

    // Add the line path
    svg.append('path')
        .datum(data) // Bind the data to the path
        .attr('class', 'line')
        .attr('d', line);

    // Add chart title
    svg.append('text')
        .attr('x', chartWidth / 2)
        .attr('y', -margin.top / 2 + 5)
        .attr('text-anchor', 'middle')
        .attr('class', 'chart-title text-gray-700 font-semibold text-lg')
        .text(`Sensor ${sensorId} Temperature`);

    // Add X-axis label
    svg.append('text')
        .attr('x', chartWidth / 2)
        .attr('y', chartHeight + margin.bottom - 10)
        .attr('text-anchor', 'middle')
        .attr('class', 'axis-label text-gray-500 text-sm')
        .text('Time');

    // Add Y-axis label
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 20)
        .attr('x', -chartHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('class', 'axis-label text-gray-500 text-sm')
        .text('Temperature (°C)');

    // Initialize tooltip (if not already initialized globally)
    let tooltip = d3.select('body').select('.tooltip');
    if (tooltip.empty()) {
        tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip');
    }


    // Add overlay for tooltip interaction
    svg.append('rect')
        .attr('class', 'overlay')
        .attr('width', chartWidth)
        .attr('height', chartHeight)
        .style('fill', 'none')
        .style('pointer-events', 'all')
        .on('mouseover', () => tooltip.classed('active', true))
        .on('mouseout', () => tooltip.classed('active', false))
        .on('mousemove', function(event) {
            const [xPos, yPos] = d3.pointer(event, this);
            const xDate = xScale.invert(xPos); // Invert x-scale to get date from pixel position

            // Find the data point closest to the mouse x position
            const bisectDate = d3.bisector(d => d.timestamp).left;
            const i = bisectDate(data, xDate, 1);
            const d0 = data[i - 1];
            const d1 = data[i];
            // Ensure d1 exists before comparing; if not, d0 is the closest
            const d = (d1 && xDate - d0.timestamp > d1.timestamp - xDate) ? d1 : d0;

            // Position and update tooltip content
            tooltip
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 20) + 'px')
                .html(`
                    Time: ${d3.timeFormat('%H:%M:%S')(d.timestamp)}<br/>
                    Temp: ${d.temperature_celsius.toFixed(1)}°C
                `);
        });
}

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Fetch data immediately on load
    fetchSensorData();
    // Set up polling for continuous updates
    setInterval(fetchSensorData, POLLING_INTERVAL_MS);

    // Add resize listener to re-render charts when window size changes
    window.addEventListener('resize', () => {
        // Re-render all charts based on current history
        Object.keys(sensorDataHistory).forEach(sensorId => {
            renderChart(sensorId, sensorDataHistory[sensorId]);
        });
    });
});
