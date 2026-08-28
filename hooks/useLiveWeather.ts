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
    cityName: "Pinnaduwa, Galle",
    isLive: false,
    lastUpdated: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}

export function useLiveWeather() {
  const [weather, setWeather] = useState<LiveWeatherData>(getFallbackWeather());
  const [loading, setLoading] = useState(true);

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
    } catch {}

    // Call secure server API route (no API key in browser)
    try {
      const res = await fetch("/api/weather");
      if (!res.ok) throw new Error("Failed to fetch secure weather proxy");
      const data: LiveWeatherData = await res.json();

      setWeather(data);
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
      } catch {}
    } catch {
      setWeather(getFallbackWeather());
    } finally {
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
