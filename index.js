const api_key = "1a6e7ef23aac45bf3c709fe4a861663e";

const cityInput = document.getElementById("city");

cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault(); // prevents form reload (if any)
    if (!cityInput.value.trim()) {
      showError("Please enter a city name!");
      return;
    }
    getWeatherByCity(cityInput.value);
  }
});

const searchBtn = document.getElementById("searchBtn");
const gpsBtn = document.getElementById("gpsBtn");
const container = document.getElementById("container");
const forecastDiv = document.getElementById("forecast");
const loading = document.getElementById("loading");
const mapContainer = document.querySelector(".weather-right"); 
const mapFrame = document.getElementById("gmap_canvas");
const forecastTitle = document.getElementById("forecast-title");
const errorMessage = document.getElementById("error-message");

searchBtn.addEventListener("click", () => {
  if (!cityInput.value.trim()) return showError("Please enter a city name!");
  getWeatherByCity(cityInput.value);
});

gpsBtn.addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(
    (pos) => getWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
    () => showError("Unable to fetch location.")
  );
});

async function getWeatherByCity(city) {
  try {
    toggleLoading(true);
    clearForecast();
    mapContainer.classList.add("hidden"); 
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api_key}`
    );
    const data = await res.json();
    if (data.cod !== 200) throw new Error(data.message);
    displayWeather(data);
    getForecast(data.coord.lat, data.coord.lon);
  } catch (e) {
    showError(e.message);
  } finally {
    toggleLoading(false);
  }
}

async function getWeatherByCoords(lat, lon) {
  try {
    toggleLoading(true);
    clearForecast();
    mapContainer.classList.add("hidden");
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}`
    );
    const data = await res.json();
    displayWeather(data);
    getForecast(lat, lon);
  } catch (e) {
    showError("Error fetching weather data.");
  } finally {
    toggleLoading(false);
  }
}

async function getForecast(lat, lon) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api_key}`
    );
    if (!res.ok) throw new Error("Forecast API failed");
    const data = await res.json();

    const dailyMap = {};
    data.list.forEach(item => {
      const dateKey = new Date(item.dt * 1000).toDateString();
      if (!dailyMap[dateKey] && item.dt_txt.includes("12:00:00")) {
        dailyMap[dateKey] = item;
      }
    });

    displayForecast(Object.values(dailyMap).slice(0, 5));
  } catch (err) {
    showError("Unable to load forecast data.");
    console.error("Forecast error:", err);
  }
}

function displayWeather(data) {
  const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  const windDir = getWindDirection(data.wind.deg);

  container.innerHTML = `
  <h2><i class="fas fa-location-dot"></i> ${data.name}</h2>
  <p><i class="fas fa-temperature-high"></i> Temp: ${Math.round(data.main.temp - 273.15)}°C</p>
  <p><i class="fas fa-thermometer-half"></i> Feels Like: ${Math.round(data.main.feels_like - 273.15)}°C</p>
  <p>
    <span class="temp-max"><i class="fas fa-arrow-up"></i> Max: ${Math.round(data.main.temp_max - 273.15)}°C</span> | 
    <span class="temp-min"><i class="fas fa-arrow-down"></i> Min: ${Math.round(data.main.temp_min - 273.15)}°C</span>
  </p>
  <p><i class="fas fa-tint"></i> Humidity: ${data.main.humidity}%</p>
  <p><i class="fas fa-wind"></i> Wind: ${data.wind.speed} km/h (${windDir})</p>
  <p><i class="fas fa-cloud-sun"></i> Condition: ${data.weather[0].description}</p>
  <p><i class="fas fa-sun"></i> Sunrise: ${sunrise} | <i class="fas fa-moon"></i> Sunset: ${sunset}</p>
`;


  document.querySelector(".weather-layout").classList.remove("hidden");
  document.querySelector(".weather-right").classList.remove("hidden");
  container.classList.remove("hidden");

  changeBackground(data.weather[0].main);
  container.classList.remove("hidden");

  // Show map only after weather data loads
  mapFrame.src = `https://maps.google.com/maps?q=${data.coord.lat},${data.coord.lon}&z=13&output=embed`;
  mapContainer.classList.remove("hidden");
}

function displayForecast(daily) {
  forecastDiv.innerHTML = "";
  daily.forEach(day => {
    const date = new Date(day.dt * 1000);
    const condition = day.weather[0].main;
    const rainProb = Math.round((day.pop || 0) * 100);
    

    const weatherIcons = {
      Clear: '<i class="fas fa-sun" style="color:#f39c12;font-size:1.5rem;"></i>',
      Clouds: '<i class="fas fa-cloud" style="color:#95a5a6;font-size:1.5rem;"></i>',
      Rain: '<i class="fas fa-cloud-showers-heavy" style="color:#3498db;font-size:1.5rem;"></i>',
      Drizzle: '<i class="fas fa-cloud-rain" style="color:#5dade2;font-size:1.5rem;"></i>',
      Thunderstorm: '<i class="fas fa-bolt" style="color:#f1c40f;font-size:1.5rem;"></i>',
      Snow: '<i class="fas fa-snowflake" style="color:#00acee;font-size:1.5rem;"></i>',
      Mist: '<i class="fas fa-smog" style="color:#7f8c8d;font-size:1.5rem;"></i>',
      Fog: '<i class="fas fa-smog" style="color:#7f8c8d;font-size:1.5rem;"></i>',
      Haze: '<i class="fas fa-water" style="color:#a4b0be;font-size:1.5rem;"></i>',
    };

    const iconHTML = weatherIcons[condition] || '<i class="fas fa-cloud"></i>';

    forecastDiv.innerHTML += `
      <div class="forecast-item">
        <p><strong><i class="fas fa-calendar-day"></i> ${date.toDateString().slice(0, 10)}</strong></p>
        ${iconHTML}
        <p><i class="fas fa-arrow-up" style="color:red;"></i> ${Math.round(day.main.temp_max - 273.15)}°C</p>
        <p><i class="fas fa-arrow-down" style="color:blue;"></i> ${Math.round(day.main.temp_min - 273.15)}°C</p>
         <p><i class="fas fa-umbrella"></i> ${rainProb}%</p>
      </div>
    `;
  });

  forecastTitle.classList.remove("hidden");
  forecastDiv.classList.remove("hidden");
}


function toggleLoading(show) {
  loading.classList.toggle("hidden", !show);
}

function clearForecast() {
  forecastDiv.innerHTML = "";
  forecastTitle.classList.add("hidden");
  forecastDiv.classList.add("hidden");
}

function showError(msg) {
  errorMessage.textContent = msg;
  errorMessage.classList.remove("hidden");
  setTimeout(() => errorMessage.classList.add("hidden"), 4000);
}

function getWindDirection(deg) {
  const directions = ['N','NE','E','SE','S','SW','W','NW'];
  return directions[Math.round(deg / 45) % 8];
}

function changeBackground(condition) {
  const bgMap = {
    Clear: "linear-gradient(135deg, #4facfe, #00f2fe)",
    Clouds: "linear-gradient(135deg, #757f9a, #d7dde8)",
    Rain: "linear-gradient(135deg, #667db6, #0082c8, #0082c8, #667db6)",
    Snow: "linear-gradient(135deg, #e0eafc, #cfdef3)",
    Thunderstorm: "linear-gradient(135deg, #283e51, #485563)",
    Mist: "linear-gradient(135deg, #606c88, #3f4c6b)"
  };
  document.body.style.background = bgMap[condition] || "linear-gradient(135deg, #a1c4fd, #c2e9fb)";
}
