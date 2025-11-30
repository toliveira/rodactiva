import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, CloudRain, Sun, Wind, Droplets, CloudSnow, CloudDrizzle, CloudFog, Zap } from "lucide-react";

interface WeatherData {
    temperature: number;
    windSpeed: number;
    weatherCode: number;
    humidity: number;
    time: string;
}

interface HourlyForecast {
    time: string;
    temperature: number;
    weatherCode: number;
}

interface WeatherWidgetProps {
    compact?: boolean;
}

export default function WeatherWidget({ compact = false }: WeatherWidgetProps) {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Castro Marim coordinates: 37.2167, -7.4500
        fetch(
            "https://api.open-meteo.com/v1/forecast?latitude=37.2167&longitude=-7.4500&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&timezone=Europe/Lisbon&forecast_days=1"
        )
            .then((res) => res.json())
            .then((data) => {
                const currentTime = new Date(data.current.time);

                setWeather({
                    temperature: Math.round(data.current.temperature_2m),
                    windSpeed: Math.round(data.current.wind_speed_10m),
                    weatherCode: data.current.weather_code,
                    humidity: data.current.relative_humidity_2m,
                    time: currentTime.toLocaleString('pt-PT', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                });

                // Get next 6 hours forecast
                const currentHour = currentTime.getHours();
                const nextHours = data.hourly.time
                    .map((time: string, index: number) => ({
                        time: new Date(time).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
                        temperature: Math.round(data.hourly.temperature_2m[index]),
                        weatherCode: data.hourly.weather_code[index],
                    }))
                    .slice(currentHour + 1, currentHour + 7);

                setHourlyForecast(nextHours);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch weather:", err);
                setLoading(false);
            });
    }, []);

    if (loading) return null;

    const getWeatherIcon = (code: number, size: string = "h-8 w-8") => {
        // WMO Weather interpretation codes
        if (code === 0) return <Sun className={`${size} text-yellow-500`} />;
        if (code <= 3) return <Cloud className={`${size} text-slate-400`} />;
        if (code <= 49) return <CloudFog className={`${size} text-slate-500`} />;
        if (code <= 59) return <CloudDrizzle className={`${size} text-blue-400`} />;
        if (code <= 69) return <CloudRain className={`${size} text-blue-500`} />;
        if (code <= 79) return <CloudSnow className={`${size} text-blue-300`} />;
        if (code <= 99) return <Zap className={`${size} text-yellow-600`} />;
        return <Cloud className={`${size} text-slate-400`} />;
    };

    const getWeatherDescription = (code: number): string => {
        if (code === 0) return "Céu limpo";
        if (code === 1) return "Maioritariamente limpo";
        if (code === 2) return "Parcialmente nublado";
        if (code === 3) return "Nublado";
        if (code <= 49) return "Nevoeiro";
        if (code <= 59) return "Chuvisco";
        if (code <= 69) return "Chuva";
        if (code <= 79) return "Neve";
        if (code <= 99) return "Trovoada";
        return "Desconhecido";
    };

    if (compact) {
        return (
            <div className="flex items-center gap-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-md">
                {weather && getWeatherIcon(weather.weatherCode, "h-6 w-6")}
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                        {weather?.temperature}°C
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                        Castro Marim
                    </span>
                </div>
            </div>
        );
    }

    return (
        <Card className="bg-white/95 backdrop-blur-sm dark:bg-slate-900/95 border-slate-200 dark:border-slate-800 shadow-lg">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-700 dark:text-slate-300">
                    Meteorologia - Castro Marim
                </CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                    {weather?.time}
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Current Weather */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {weather && getWeatherIcon(weather.weatherCode, "h-12 w-12")}
                        <div>
                            <div className="text-3xl font-bold text-slate-900 dark:text-white">
                                {weather?.temperature}°C
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                {weather && getWeatherDescription(weather.weatherCode)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Weather Details */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                        <Wind className="h-4 w-4 text-slate-500" />
                        <div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">Vento</div>
                            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                {weather?.windSpeed} km/h
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Droplets className="h-4 w-4 text-slate-500" />
                        <div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">Humidade</div>
                            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                {weather?.humidity}%
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hourly Forecast */}
                {hourlyForecast.length > 0 && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                        <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                            Próximas Horas
                        </div>
                        <div className="grid grid-cols-6 gap-2">
                            {hourlyForecast.map((hour, index) => (
                                <div key={index} className="flex flex-col items-center gap-1 text-center">
                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                        {hour.time.split(':')[0]}h
                                    </div>
                                    {getWeatherIcon(hour.weatherCode, "h-5 w-5")}
                                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        {hour.temperature}°
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
