"use client";

import { useState, useEffect, useCallback } from "react";

export interface LiveWeatherData {
  temp: number;
  feelsLike: number;
  condition: "Clear" | "Clouds" | "Rain" | "Drizzle" | "Thunderstorm" | "Mist" | "Haze" | "Fog";
  description: string;
  cloudCoverage: number; // 0 to 100%
  rainIntensity: number; // 0 to 1 (0 = none, 0.3 = light drizzle, 0.7 = heavy rain)
  windSpeed: number; // km/h
  windDeg: number; // degrees
  humidity: number; // %
  cityName: string;
  isLive: boolean;
  lastUpdated: string;
}

const API_KEY = "c070bcffa7b657af94243f076afe0468";
const LAT = 6.0779352;
const LON = 80.2623579;
const CACHE_KEY = "kekulama_live_weather";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

// Default tropical climate for Galle based on time of day
function getFallbackWeather(): LiveWeatherData {
  const hour = new Date().getHours();
  const isNight = hour < 6 || hour >= 19;
  const temp = isNight ? 25 : 29;

  return {
    temp,
    feelsLike: temp + 3,
    condition: "Clouds",
    description: "scattered tropical clouds",
    cloudCoverage: 40,
    rainIntensity: 0,
    windSpeed: 12,
    windDeg: 220,
    humidity: 78,
    cityName: "Galle, Sri Lanka",
    isLive: false,
    lastUpdated: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}

export function useLiveWeather() {
  const [weather, setWeather] = useState<LiveWeatherData>(getFallbackWeather());
  const [loading, setLoading] = useState(true);

  const parseWeatherResponse = (data: any): LiveWeatherData => {
    const rawCondition = data.weather?.[0]?.main || "Clouds";
    let condition: LiveWeatherData["condition"] = "Clouds";

    if (["Clear"].includes(rawCondition)) condition = "Clear";
    else if (["Rain"].includes(rawCondition)) condition = "Rain";
    else if (["Drizzle"].includes(rawCondition)) condition = "Drizzle";
    else if (["Thunderstorm"].includes(rawCondition)) condition = "Thunderstorm";
    else if (["Mist", "Haze", "Fog"].includes(rawCondition)) condition = rawCondition as any;
    else condition = "Clouds";

    // Calculate rain intensity
    let rainIntensity = 0;
    if (condition === "Drizzle") rainIntensity = 0.3;
    else if (condition === "Rain") {
      const rain1h = data.rain?.["1h"] || 2.5;
      rainIntensity = Math.min(1, Math.max(0.4, rain1h / 10));
    } else if (condition === "Thunderstorm") {
      rainIntensity = 0.9;
    }

    return {
      temp: Math.round(data.main?.temp ?? 28),
      feelsLike: Math.round(data.main?.feels_like ?? 31),
      condition,
      description: data.weather?.[0]?.description || "partly cloudy",
      cloudCoverage: data.clouds?.all ?? 40,
      rainIntensity,
      windSpeed: Math.round((data.wind?.speed ?? 3.5) * 3.6), // convert m/s to km/h
      windDeg: data.wind?.deg ?? 220,
      humidity: data.main?.humidity ?? 78,
      cityName: data.name ? `${data.name}, Sri Lanka` : "Pinnaduwa, Galle",
      isLive: true,
      lastUpdated: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const fetchWeather = useCallback(async () => {
    // Check session cache first
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { timestamp, data } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL_MS) {
          setWeather(data);
          setLoading(false);
          return;
        }
      }
    } catch {
      // ignore storage errors
    }

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric`
      );

      if (!res.ok) {
        // Fallback to realistic tropical conditions if key is pending activation
        setWeather(getFallbackWeather());
        setLoading(false);
        return;
      }

      const data = await res.json();
      const parsed = parseWeatherResponse(data);
      setWeather(parsed);
      setLoading(false);

      try {
        sessionStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ timestamp: Date.now(), data: parsed })
        );
      } catch {
        // ignore
      }
    } catch (err) {
      setWeather(getFallbackWeather());
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, CACHE_TTL_MS);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  return { weather, loading, refetch: fetchWeather };
}
