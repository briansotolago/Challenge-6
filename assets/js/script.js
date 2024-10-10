// Weather Dashboard JavaScript

// API Configuration
const API_KEY = '7db271b7136f70e4400fe45867137303'; // Use your provided API key
let searchHistory = [];

// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const searchHistoryEl = document.getElementById('search-history');
const currentWeather = document.getElementById('current-weather');
const forecastContainer = document.getElementById('forecast-container');

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        handleSearch();
    }
});
searchHistoryEl.addEventListener('click', handleHistoryClick);
document.addEventListener('DOMContentLoaded', renderHistory);

// Main Functions

// Handle the search when the search button is clicked
async function handleSearch() {
    const city = cityInput.value.trim();
    if (city) {
        const weatherData = await getWeatherData(city);
        if (weatherData) {
            updateWeatherDisplay(weatherData);
            addToSearchHistory(city);
            cityInput.value = ''; // Clear the input field
        }
    }
}

// Handle clicks on the search history buttons
function handleHistoryClick(event) {
    if (event.target.classList.contains('history-btn')) {
        cityInput.value = event.target.textContent;
        handleSearch();
    }
}

// Fetch weather data from the API
async function getWeatherData(city) {
    try {
        // First, get coordinates for the city
        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`;
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();
        console.log("Geo Data: ", geoData);

        if (geoData.length === 0) {
            throw new Error('City not found');
        }

        const { lat, lon } = geoData[0];

        // Then, get 5 day / 3 hour forecast data using coordinates
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`;
        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();
        console.log("Forecast Data: ", forecastData);

        return forecastData;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert('Error fetching weather data. Please try again.');
    }
}

// Update the weather display on the page
function updateWeatherDisplay(data) {
    const current = data.list[0];
    currentWeather.innerHTML = `
        <h2>${data.city.name} (${new Date(current.dt * 1000).toLocaleDateString()}) 
            <img src="https://openweathermap.org/img/wn/${current.weather[0].icon}.png" alt="${current.weather[0].description}">
        </h2>
        <p>Temp: ${current.main.temp.toFixed(2)}°F</p>
        <p>Wind: ${current.wind.speed.toFixed(2)} MPH</p>
        <p>Humidity: ${current.main.humidity}%</p>
    `;

    // Update 5-day forecast
    forecastContainer.innerHTML = ''; // Clear previous forecast
    for (let i = 0; i < data.list.length; i += 8) { // Take one entry for each day (every 8th entry)
        const day = data.list[i];
        const forecastCard = document.createElement('div');
        forecastCard.classList.add('col-12', 'col-md-4', 'mb-3'); // Responsive columns
        forecastCard.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h4>${new Date(day.dt * 1000).toLocaleDateString()}</h4>
                    <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="${day.weather[0].description}">
                    <p>Temp: ${day.main.temp.toFixed(2)}°F</p>
                    <p>Wind: ${day.wind.speed.toFixed(2)} MPH</p>
                    <p>Humidity: ${day.main.humidity}%</p>
                </div>
            </div>
        `;
        forecastContainer.appendChild(forecastCard);
    }
}

// Add a city to the search history
function addToSearchHistory(city) {
    // Check if the city already exists in the search history
    if (!searchHistory.includes(city)) {
        const historyBtn = document.createElement('button');
        historyBtn.classList.add('history-btn', 'btn', 'btn-secondary', 'mb-2');
        historyBtn.textContent = city;
        searchHistory.unshift(city); // Add to the beginning of the array
        
        // Limit history to 8 items
        if (searchHistory.length > 8) {
            searchHistory.pop();
        }
        
        localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
        searchHistoryEl.prepend(historyBtn);
        
        // Remove excess buttons if there are more than 8
        while (searchHistoryEl.children.length > 8) {
            searchHistoryEl.removeChild(searchHistoryEl.lastChild);
        }
    }
}

// Render search history from local storage
function renderHistory() {
    searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
    searchHistoryEl.innerHTML = ''; // Clear existing buttons
    
    searchHistory.forEach(city => {
        const historyBtn = document.createElement('button');
        historyBtn.classList.add('history-btn', 'btn', 'btn-secondary', 'mb-2');
        historyBtn.textContent = city;
        searchHistoryEl.appendChild(historyBtn);
    });
}
