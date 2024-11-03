const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const locationBtn = document.getElementById("location-btn");
const weatherDisplay = document.getElementById("weather-display");
const themeToggle = document.getElementById("theme-toggle");
const unitToggle = document.getElementById("unit-toggle");
const backgroundAnimation = document.getElementById("background-animation");

let isDarkTheme = false;
let isMetric = true;
let currentWeatherData = null;

const apiKey = "473aba324aa32112188aecadbbaf2dcb"; // Replace with your actual API key

// Fetch weather data and forecast
// Fetch weather data and forecast
const fetchWeatherAndForecast = async (city) => {
  setLoading(true);
  try {
    // Current weather data
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );
    const weatherData = await weatherResponse.json();

    if (!weatherResponse.ok) throw new Error(weatherData.message);

    // 5-day forecast data (free tier)
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
    );
    const forecastData = await forecastResponse.json();

    if (!forecastResponse.ok) throw new Error(forecastData.message);

    currentWeatherData = weatherData;
    displayWeather(weatherData, forecastData);
    updateBackground(weatherData.weather[0].main);
  } catch (error) {
    showError(error.message);
  } finally {
    setLoading(false);
  }
};

// Display weather information
// Modified display weather function
const displayWeather = (weatherData, forecastData) => {
  if (!weatherData || !forecastData) return;

  const temp = isMetric
    ? weatherData.main.temp
    : (weatherData.main.temp * 9) / 5 + 32;
  const windSpeed = isMetric
    ? weatherData.wind.speed
    : weatherData.wind.speed * 2.237;
  const unitSymbol = isMetric ? "°C" : "°F";
  const windUnit = isMetric ? "m/s" : "mph";

  const sunriseTime = new Date(
    weatherData.sys.sunrise * 1000
  ).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const sunsetTime = new Date(weatherData.sys.sunset * 1000).toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  weatherDisplay.innerHTML = `
    <img class="weather-icon floating" src="http://openweathermap.org/img/wn/${
      weatherData.weather[0].icon
    }@2x.png" alt="${weatherData.weather[0].description}">
    <div class="temperature">${Math.round(temp)}${unitSymbol}</div>
    <div class="description">${weatherData.weather[0].description}</div>
    <div class="city">${weatherData.name}, ${weatherData.sys.country}</div>
    <div class="details">
      <div class="detail-item">
        <div class="detail-label">Humidity</div>
        <div class="detail-value">${weatherData.main.humidity}%</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Wind</div>
        <div class="detail-value">${windSpeed.toFixed(1)} ${windUnit}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Pressure</div>
        <div class="detail-value">${weatherData.main.pressure} hPa</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Sunrise</div>
        <div class="detail-value">${sunriseTime}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Sunset</div>
        <div class="detail-value">${sunsetTime}</div>
      </div>
    </div>
    <div class="forecast">
      <h3>5-Day Forecast</h3>
      <div class="forecast-container">
        ${generateForecastHTML(forecastData.list)}
      </div>
    </div>
  `;
};

const generateForecastHTML = (forecastList) => {
  // Group forecast by day
  const dailyForecasts = {};

  forecastList.forEach((forecast) => {
    const date = new Date(forecast.dt * 1000);
    const day = date.toLocaleDateString("en-US", { weekday: "short" });

    // Only take the first forecast for each day (usually around noon)
    if (!dailyForecasts[day]) {
      dailyForecasts[day] = forecast;
    }
  });

  // Convert to array and take first 5 days
  return Object.values(dailyForecasts)
    .slice(1, 6) // Skip today, show next 5 days
    .map((forecast) => {
      const date = new Date(forecast.dt * 1000);
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
      const temp = isMetric
        ? forecast.main.temp
        : (forecast.main.temp * 9) / 5 + 32;
      const unitSymbol = isMetric ? "°C" : "°F";

      return `
      <div class="forecast-day">
        <div class="forecast-date">${dayName}</div>
        <img class="forecast-icon" src="http://openweathermap.org/img/wn/${
          forecast.weather[0].icon
        }.png" alt="${forecast.weather[0].description}">
        <div class="forecast-temp">${Math.round(temp)}${unitSymbol}</div>
      </div>
    `;
    })
    .join("");
};

// Update background based on weather condition
const updateBackground = (weatherCondition) => {
  const weatherConditions = {
    Clouds: "cloudy",
    Rain: "rainy",
    Snow: "snowy",
    Clear: "sunny",
    Thunderstorm: "thunderstorm",
    Drizzle: "rainy",
    Mist: "cloudy",
    Fog: "cloudy",
  };

  const backgroundClass = weatherConditions[weatherCondition] || "default";
  backgroundAnimation.className = `background ${backgroundClass}`;
};

// Toggle theme
themeToggle.addEventListener("click", () => {
  isDarkTheme = !isDarkTheme;
  document.body.classList.toggle("dark-theme");
  themeToggle.textContent = isDarkTheme ? "☀️" : "🌙";
});

// Toggle unit
unitToggle.addEventListener("click", () => {
  isMetric = !isMetric;
  unitToggle.textContent = isMetric ? "°C" : "°F";
  if (currentWeatherData) {
    fetchWeatherAndForecast(currentWeatherData.name);
  }
});

// Search for city
searchBtn.addEventListener("click", async () => {
  const city = cityInput.value.trim();
  if (city) {
    await fetchWeatherAndForecast(city);
    cityInput.value = "";
  }
});

// Add keyboard support for search
cityInput.addEventListener("keypress", async (event) => {
  if (event.key === "Enter") {
    const city = cityInput.value.trim();
    if (city) {
      await fetchWeatherAndForecast(city);
      cityInput.value = "";
    }
  }
});

// Get user location (continued...)
locationBtn.addEventListener("click", async () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const cityResponse = await fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`
          );
          if (!cityResponse.ok) throw new Error("Failed to get location");
          const cityData = await cityResponse.json();
          if (!cityData.length) throw new Error("Location not found");
          const city = cityData[0].name;
          await fetchWeatherAndForecast(city);
        } catch (error) {
          showError(error.message);
        }
      },
      (error) => {
        showError("Unable to retrieve your location");
      }
    );
  } else {
    showError("Geolocation is not supported by your browser");
  }
});

// Show error message
const showError = (message) => {
  weatherDisplay.innerHTML = `<div class="error">${message}</div>`;
};

// Set loading state
const setLoading = (loading) => {
  if (loading) {
    weatherDisplay.innerHTML = '<div class="loading">Loading...</div>';
  }
};

// Initialize theme based on user's system preference
const initializeTheme = () => {
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    isDarkTheme = true;
    document.body.classList.add("dark-theme");
    themeToggle.textContent = "☀️";
  }
};

// Initialize unit based on user's locale
const initializeUnit = () => {
  // Use Fahrenheit for US, Myanmar, and Liberia
  const fahrenheitCountries = ["US", "MM", "LR"];
  const userLocale = navigator.language.split("-")[1] || "US";

  if (fahrenheitCountries.includes(userLocale)) {
    isMetric = false;
    unitToggle.textContent = "°F";
  }
};

// Initialize the app
const initializeApp = () => {
  initializeTheme();
  initializeUnit();

  // Optional: Load weather for user's location on startup
  locationBtn.click();
};

// Start the app
initializeApp();
