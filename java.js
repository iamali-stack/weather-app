// Weather API Configuration
const API_KEY = '1aee38768bf145a999f112347253004';
const BASE_URL = 'https://api.weatherapi.com/v1';

// Function to get user's location
function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                };
                resolve(location);
            },
            (error) => {
                console.error('Error getting location:', error);
                // Show user-friendly error message
                const errorMessage = document.createElement('div');
                errorMessage.className = 'alert alert-warning mt-3';
                errorMessage.textContent = 'Unable to detect your location. Please enable location access or search for a city manually.';
                document.querySelector('.search-form').after(errorMessage);
                reject(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    });
}

// Function to fetch current weather
async function getCurrentWeather(location) {
    try {
        const response = await fetch(`${BASE_URL}/current.json?key=${API_KEY}&q=${location}`);
        if (!response.ok) {
            throw new Error('Weather data not found');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching weather:', error);
        throw error;
    }
}

// Function to fetch forecast weather
async function getForecastWeather(location) {
    try {
        const response = await fetch(`${BASE_URL}/forecast.json?key=${API_KEY}&q=${location}&days=3`);
        if (!response.ok) {
            throw new Error('Forecast data not found');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching forecast:', error);
        throw error;
    }
}

// Function to update the UI with weather data
function updateWeatherUI(data) {
    // Update current weather
    document.getElementById('city-name').textContent = data.location.name;
    document.getElementById('today-temp').textContent = `${data.current.temp_c}°C`;
    document.getElementById('today-status').textContent = data.current.condition.text;
    document.getElementById('today-humidity').textContent = `${data.current.humidity}%`;
    document.getElementById('today-wind').textContent = `${data.current.wind_kph} km/h`;
    document.getElementById('today-wind-direction').textContent = data.current.wind_dir;

    // Update today's date
    const today = new Date();
    document.getElementById('today-day').textContent = today.toLocaleDateString('en-US', { weekday: 'long' });
    document.getElementById('today-date').textContent = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Function to update forecast UI
function updateForecastUI(data) {
    const forecastDays = data.forecast.forecastday;
    
    // Update tomorrow's forecast
    const tomorrow = forecastDays[1];
    document.getElementById('tomorrow').textContent = new Date(tomorrow.date).toLocaleDateString('en-US', { weekday: 'long' });
    document.getElementById('tomorrow-temp').textContent = `${tomorrow.day.avgtemp_c}°C`;
    document.getElementById('tomorrow-min-temp').textContent = `${tomorrow.day.mintemp_c}°`;
    document.getElementById('tomorrow-status').textContent = tomorrow.day.condition.text;

    // Update day after tomorrow's forecast
    const dayAfterTomorrow = forecastDays[2];
    document.getElementById('the day after tomorrow').textContent = new Date(dayAfterTomorrow.date).toLocaleDateString('en-US', { weekday: 'long' });
    document.getElementById('the day after tomorrow-temp').textContent = `${dayAfterTomorrow.day.avgtemp_c}°C`;
    document.getElementById('the day after tomorrow-min-temp').textContent = `${dayAfterTomorrow.day.mintemp_c}°`;
    document.getElementById('the day after tomorrow-status').textContent = dayAfterTomorrow.day.condition.text;

    // Function to set weather icon based on condition
    function setWeatherIcon(elementId, conditionText) {
        const iconElement = document.getElementById(elementId);
        
        if (conditionText.toLowerCase().includes('sunny')) {
            iconElement.innerHTML = '<img src="images/sunny.png" alt="Sunny">';
            console.log('Sunny condition for', elementId);
        }
        else if (conditionText.toLowerCase().includes('clear')) {
            iconElement.innerHTML = '<img src="images/clear.webp" alt="Clear">';
            console.log('Clear condition for', elementId);
        }
        else if (conditionText.toLowerCase().includes('partly cloudy')) {
            iconElement.innerHTML = '<img src="images/partly cloudy.png" alt="Partly Cloudy">';
            console.log('Partly cloudy condition for', elementId);
        }
        else if (conditionText.toLowerCase().includes('cloudy') || conditionText.toLowerCase().includes('Overcast')) {
            iconElement.innerHTML = '<img src="images/cloudy.webp" alt="Cloudy">';
            console.log('Cloudy condition for', elementId);
        }
        else if (conditionText.toLowerCase().includes('patchy rain nearby')) {
            iconElement.innerHTML = '<img src="images/patcy rain nearby.png" alt="Fog">';
            console.log('Fog condition for', elementId);
        }
        else if (conditionText.toLowerCase().includes('heavy rain') ) {
            iconElement.innerHTML = '<img src="images/heavy-rain.webp" alt="Rain">';
            console.log('Rain condition for', elementId);
        }
        else if (conditionText.toLowerCase().includes('light rain shower')) {
            iconElement.innerHTML = '<img src="images/light-rain-shower.webp" alt="light rain shower">';
            console.log('Snow condition for', elementId);
        }
        else if (conditionText.toLowerCase().includes('thunder') || conditionText.toLowerCase().includes('Storm')) {
            iconElement.innerHTML = '<img src="images/Thundery outbreaks in nearby.webp" alt="Thunderstorm">';
            console.log('Thunderstorm condition for', elementId);
        }
        else if (conditionText.toLowerCase().includes('moderate rain')) {
            iconElement.innerHTML = '<img src="images/moderate rain.webp" alt="Windy">';
            console.log('Windy condition for', elementId);
        }
      
    }

    // Set icons for all three days
    setWeatherIcon('today-icon', data.current.condition.text);
    setWeatherIcon('tomorrow-icon', tomorrow.day.condition.text);
    setWeatherIcon('the day after tomorrow-icon', dayAfterTomorrow.day.condition.text);
}

// Function to handle search form submission
async function handleSearch(event) {
    event.preventDefault();
    const searchInput = document.querySelector('.search-input');
    const location = searchInput.value.trim();

    if (location) {
        try {
            const currentWeather = await getCurrentWeather(location);
            const forecastWeather = await getForecastWeather(location);
            
            updateWeatherUI(currentWeather);
            updateForecastUI(forecastWeather);
        } catch (error) {
            alert('Error fetching weather data. Please try again.');
            console.error(error);
        }
    }
}

// Function to load weather data for user's location
async function loadUserLocationWeather() {
    try {
        const userLocation = await getUserLocation();
        const locationString = `${userLocation.lat},${userLocation.lon}`;
        
        const currentWeather = await getCurrentWeather(locationString);
        const forecastWeather = await getForecastWeather(locationString);
        
        updateWeatherUI(currentWeather);
        updateForecastUI(forecastWeather);
    } catch (error) {
        console.error('Error loading user location weather:', error);
        // Show user-friendly error message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'alert alert-warning mt-3';
        errorMessage.textContent = 'Loading default weather for Cairo. You can search for your location manually.';
        document.querySelector('.search-form').after(errorMessage);
        // Fallback to Cairo if geolocation fails
        loadDefaultWeather();
    }
}

// Function to load default weather data for Cairo
async function loadDefaultWeather() {
    try {
        const currentWeather = await getCurrentWeather('Cairo');
        const forecastWeather = await getForecastWeather('Cairo');
        
        updateWeatherUI(currentWeather);
        updateForecastUI(forecastWeather);
    } catch (error) {
        console.error('Error loading default weather:', error);
    }
}

// Add event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Try to load weather for user's location first
    loadUserLocationWeather();
    
    // Add search form event listener
    const searchForm = document.querySelector('.search-form');
    searchForm.addEventListener('submit', handleSearch);

    // Add click event listener to Home link
    const homeLink = document.querySelector('.nav-link[href="#"]');
    homeLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.reload();
    });

    // Add click event listener to logo
    const logo = document.querySelector('.navbar-brand');
    logo.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.reload();
    });
});

