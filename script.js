
const API_KEY = 'PLACEHOLDER'; // Get your own API key from https://openweathermap.org/

// DOM Elements
let cityInput = document.getElementById('city-input');
let searchBtn = document.getElementById('search-btn');
let errorContainer = document.getElementById('error-container');
let load_wait = document.getElementById('load_wait');
let weatherToday = document.getElementById('current-weather');
let forecastContainer = document.getElementById('forecast-container');
let weatherCards = document.getElementById('forecast-cards');  
let howUse = document.getElementById('howUse');

// Current weather elements
let cityName = document.getElementById('city-name');
let currentDate = document.getElementById('current-date');
let weatherIcon = document.getElementById('weather-icon');
let temperature = document.getElementById('temperature');
let weatherDescription = document.getElementById('weather-description');
let feelsLike = document.getElementById('feels-like');
let humidity = document.getElementById('humidity');
let windSpeed = document.getElementById('wind-speed');
let sunrise = document.getElementById('sunrise');
let sunset = document.getElementById('sunset');

let isMetric = true;


// API key and base URL

const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

//const API_KEY = 'PLACEHOLDER'; // Get your own API key from https://openweathermap.org/

console.log(1111, API_KEY);

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Show howUse initially
    howUse.style.display = 'block';
   
    
    // Set up event listeners
    searchBtn.addEventListener('click', handleSearch);
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // Load default city
    fetchWeatherData('London');


    // Add unit toggle event listener
    const unitToggle = document.getElementById('unit-toggle');
    const unitText = document.getElementById('unit-text');
    
    unitToggle.addEventListener('change', () => {
        isMetric = !isMetric;
        unitText.textContent = isMetric ? '°C' : '°F';
        
        // Refresh weather data with new units
        const currentCity = cityName.textContent;
        if (currentCity) {
            fetchWeatherData(currentCity);
        }
    });
});

// Handle search
function handleSearch() {
    let city = cityInput.value.trim();
    if (city) {
        fetchWeatherData(city);
    }
}


// Show error message
function showError(message) {
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
    load_wait.style.display = 'none';
}

// Get today's date in a readable format
function getTodayDate() {
    let now = new Date();
    let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return now.toLocaleDateString('en-US', options);
}






// Fetch current weather from API
async function fetchWeatherData(city) {



    try {

        // Use the units parameter based on preference
        const units = isMetric ? 'metric' : 'imperial';
        console.log(444, units);

        console.log(1111, API_KEY);


        let responseData = await fetch(
            `${WEATHER_BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=${units}`
        );
       
        
        var isResponse = responseData.ok;
        //console.log(77777, responseData);


        if (!isResponse) {
            throw new Error('City not found');
        }
        
        let currentData = await responseData.json();
        console.log(22222, currentData);
        
        // Fetch 5-day forecast
        
        
        let responseForecastData = await fetch(
            `${WEATHER_BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=${units}`
        );

        if (!responseForecastData.ok) {
            throw new Error('Forecast data not available');
        }
        
        let forecastData = await responseForecastData.json();
        
        // Process and display the data
        displayWeatherToday(currentData);
        displayForecast(forecastData);
        
        // Hide load_wait
        load_wait.style.display = 'none';
        
    } catch (error) {
        showError(error.message);
        load_wait.style.display = 'none';
    }
}

// Display  current weather data
function displayWeatherToday(data) {
    // Process sunrise and sunset times
    let sunriseTime = new Date(data.sys.sunrise * 1000);
    let sunsetTime = new Date(data.sys.sunset * 1000);

    // Display current weather
    cityName.textContent = data.name;
    currentDate.textContent = getTodayDate();
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    weatherIcon.alt = data.weather[0].description;    




    temperature.textContent = Math.round(data.main.temp);
    weatherDescription.textContent = data.weather[0].description;
    feelsLike.textContent = Math.round(data.main.feels_like);
    humidity.textContent = data.main.humidity;


    //windSpeed.textContent = Math.round(data.wind.speed);
    // Showing units for the windspeed 
      
    const speedUnit = isMetric ? 'km/h' : 'mph';
    windSpeed.textContent = Math.round(data.wind.speed) + ' ' + speedUnit;



    sunrise.textContent = sunriseTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    sunset.textContent = sunsetTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    weatherToday.style.display = 'block';



}




// Display  forecast data
function displayForecast(data) {
    // Clear previous forecast cards
    weatherCards.innerHTML = '';
    
    // Extract daily forecasts (OpenWeather returns 3-hour forecasts)
    let dailyForecasts = getDailyForecasts(data.list);
    //console.log(5555, dailyForecasts);


    // Create forecast cards
    dailyForecasts.forEach(day => {
        let card = document.createElement('div');
        card.className = 'forecast-card';
        
        let date = new Date(day.dt * 1000);
       // console.log(111, date);
         
        // Check if weather data exists
        let weatherIcon = day.weather && day.weather.icon ? day.weather.icon : '01d'; // Default icon
        let weatherDesc = day.weather && day.weather.description ? day.weather.description : 'No data';
         

        // Set the card content
        card.innerHTML = `
            <h4>${date.toLocaleDateString('en-US', { weekday: 'long' })}</h4>
            <img src="https://openweathermap.org/img/wn/${weatherIcon}.png" alt="${weatherDesc}">
            <div class="forecast-desc">${weatherDesc}</div>
            <div class="forecast-temp">
                <span class="min">${Math.round(day.temp.min)}${isMetric ? '°C' : '°F'}</span>
                <span>/</span>
                <span class="max">${Math.round(day.temp.max)}${isMetric ? '°C' : '°F'}</span>
            </div>
        `;
        
        weatherCards.appendChild(card);
    });
    
    forecastContainer.style.display = 'block';
}








// Extract daily forecasts from 3-hour forecast data
function getDailyForecasts(forecastList) {

    // Group forecasts by day
    let dailyForecasts = {};
    
    forecastList.forEach(forecast => {

        if (!forecast.weather || !forecast.weather[0]) {
            return; // Skip this forecast entry if weather data is missing
        }

        let date = new Date(forecast.dt * 1000);
        let day = date.toISOString().split('T')[0];
        
        if (!dailyForecasts[day]) {
            dailyForecasts[day] = {
                dt: forecast.dt,
                temps: [],
                weather: forecast.weather[0],
                temp: { min: Infinity, max: -Infinity }
            };
        }
        
        // Keep track of min and max temperatures
        dailyForecasts[day].temps.push(forecast.main.temp);
        dailyForecasts[day].temp.min = Math.min(dailyForecasts[day].temp.min, forecast.main.temp);
        dailyForecasts[day].temp.max = Math.max(dailyForecasts[day].temp.max, forecast.main.temp);
        
        // Prefer around daytime (12:00) weather description
        let hour = date.getHours();
        if (hour >10 && hour < 14) {
            dailyForecasts[day].weather = forecast.weather[0];
        }
    });
    
    // Convert to array and get only the next 5 days
    return Object.values(dailyForecasts).slice(0, 5);
}


