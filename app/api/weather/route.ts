import { NextResponse } from "next/server";

// Secure server-side weather proxy
// API Key is strictly hidden on the server and never sent to client JS bundle
const API_KEY = process.env.OPENWEATHER_API_KEY || "c070bcffa7b657af94243f076afe0468";
const LAT = 6.0779352;
const LON = 80.2623579;

// In-memory server cache to prevent rate-limiting and protect API quota
let cachedWeatherData: any = null;
let lastFetchTimestamp = 0;
const SERVER_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export async function GET() {
  const now = Date.now();

  // Return server-cached data if valid
  if (cachedWeatherData && now - lastFetchTimestamp < SERVER_CACHE_TTL_MS) {
    return NextResponse.json(
      { success: true, ...cachedWeatherData, cached: true },
      {
        headers: {
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
        },
      }
    );
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&units=metric&appid=${API_KEY}`;
    const res = await fetch(url, { next: { revalidate: 600 } });

    if (!res.ok) {
      throw new Error(`OpenWeather API returned status ${res.status}`);
    }

    const data = await res.json();

    const rawCondition = data.weather?.[0]?.main || "Clouds";
    let condition = "Clouds";

    if (["Clear"].includes(rawCondition)) condition = "Clear";
    else if (["Rain"].includes(rawCondition)) condition = "Rain";
    else if (["Drizzle"].includes(rawCondition)) condition = "Drizzle";
    else if (["Thunderstorm"].includes(rawCondition)) condition = "Thunderstorm";
    else if (["Mist", "Haze", "Fog"].includes(rawCondition)) condition = rawCondition;
    else condition = "Clouds";

    let rainIntensity = 0;
    if (condition === "Drizzle") rainIntensity = 0.3;
    else if (condition === "Rain") {
      const rain1h = data.rain?.["1h"] || 2.5;
      rainIntensity = Math.min(1, Math.max(0.4, rain1h / 10));
    } else if (condition === "Thunderstorm") {
      rainIntensity = 0.9;
    }

    const parsedData = {
      temp: Math.round(data.main?.temp ?? 28),
      feelsLike: Math.round(data.main?.feels_like ?? 31),
      condition,
      description: data.weather?.[0]?.description || "partly cloudy",
      cloudCoverage: data.clouds?.all ?? 40,
      rainIntensity,
      windSpeed: Math.round((data.wind?.speed ?? 3.5) * 3.6),
      windDeg: data.wind?.deg ?? 220,
      humidity: data.main?.humidity ?? 78,
      cityName: "Pinnaduwa, Galle",
      isLive: true,
      lastUpdated: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    cachedWeatherData = parsedData;
    lastFetchTimestamp = now;

    return NextResponse.json(
      { success: true, ...parsedData, cached: false },
      {
        headers: {
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
        },
      }
    );
  } catch (err: any) {
    // Graceful secure fallback
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour >= 19;
    const temp = isNight ? 25 : 29;

    const fallback = {
      temp,
      feelsLike: temp + 3,
      condition: "Clouds",
      description: "scattered tropical clouds",
      cloudCoverage: 40,
      rainIntensity: 0,
      windSpeed: 12,
      windDeg: 220,
      humidity: 78,
      cityName: "Pinnaduwa, Galle",
      isLive: false,
      lastUpdated: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    return NextResponse.json({ success: true, ...fallback, isFallback: true });
  }
}
