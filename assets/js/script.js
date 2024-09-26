const apiKey = '0e8cda46e1ea2a1ee1933e9d069e19d0'; // Obligatory rage comment about how long it took to work/register


const form = document.getElementById('city-search-form'); // Both of these are for the event listener at the bottom
const cityInput = document.getElementById('city-input');


let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
displaySearchHistory();

async function getWeatherData(cityName) {
    try {
        const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`);
        const geoData = await geoRes.json();
        const { lat, lon } = geoData[0];

        const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`);
        const weatherData = await weatherRes.json();

        displayCurrentWeather(weatherData);
        displayForecast(weatherData);
        saveToHistory(weatherData.city.name);
    } catch (error) {
        console.error("Error fetching data: City probably doesn't exist.", error);
    }
}
function displayCurrentWeather(data) {
    const city = data.city.name;
    const { temp, humidity } = data.list[0].main;
    const { speed: windSpeed } = data.list[0].wind;
    const weatherIcon = data.list[0].weather[0].icon;

    const cityNameDisplay = document.getElementById('city-name');
    const currentWeatherDetails = document.getElementById('current-weather-details');

    cityNameDisplay.innerHTML = `
        <div class="current-weather-header">
            <span>${city} (${new Date(data.list[0].dt_txt).toLocaleDateString()})</span>
            <img src="https://openweathermap.org/img/wn/${weatherIcon}.png" alt="Weather Icon" class="weather-icon">
        </div>
    `;

    currentWeatherDetails.innerHTML = `
        <p>Temp: ${temp}°F</p>
        <p>Wind: ${windSpeed} MPH</p>
        <p>Humidity: ${humidity}%</p>
    `;
}

function displayForecast(data) {
    const forecastDetails = document.getElementById('forecast-details');
    forecastDetails.innerHTML = '';
    for (let i = 0; i < data.list.length; i += 8) {
        const { dt_txt } = data.list[i];
        const { temp, humidity } = data.list[i].main;
        const { speed: windSpeed } = data.list[i].wind;
        const weatherIcon = data.list[i].weather[0].icon;

        const forecastCard = `
            <div class="forecast-card">
                <h4>${new Date(dt_txt).toLocaleDateString()}</h4>
                <img src="https://openweathermap.org/img/wn/${weatherIcon}.png" alt="Weather Icon">
                <p>Temp: ${temp}°F</p>
                <p>Wind: ${windSpeed} MPH</p>
                <p>Humidity: ${humidity}%</p>
            </div>
        `;
        forecastDetails.innerHTML += forecastCard;
    }
}

function saveToHistory(cityName) {
    if (!searchHistory.includes(cityName)) {
        searchHistory.push(cityName);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        displaySearchHistory();
    }
}

function displaySearchHistory() {
    const history = document.getElementById('history-list');
    history.innerHTML = '';
    searchHistory.forEach(city => {
        const li = document.createElement('li');
        li.textContent = city;
        li.addEventListener('click', () => getWeatherData(city));
        history.appendChild(li);
    });
}

// For when you search for a city
form.addEventListener('submit', (event) => {
    event.preventDefault();
    console.log()
    const cityName = cityInput.value.trim();
    if (cityName) {
        getWeatherData(cityName);
        cityInput.value = '';
    }
});