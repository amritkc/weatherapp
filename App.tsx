import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, PermissionsAndroid, Platform, ActivityIndicator } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';

// Define the type for weather data
interface WeatherData {
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

const API_KEY = 'YOUR_API_KEY';

const App: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getLocation();
        } else {
          setErrorMsg('Location permission denied');
          setLoading(false);
        }
      } else {
        getLocation();
      }
    };

    requestLocationPermission();
  }, []);
  const getLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeather(latitude, longitude);
      },
      (error) => {
        console.log(error.code, error.message);
        setErrorMsg('Error getting location');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const fetchWeather = async (lat: number, lon: number) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      const data = response.data;
      setWeather({
        temperature: data.main.temp,
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        icon: `http://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`,
      });
    } catch (error) {
      setErrorMsg('Error fetching weather data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : weather ? (
        <View style={styles.weatherCard}>
          <Text style={styles.title}>The weather at your current location:</Text>
          <Text style={styles.temperature}>{Math.round(weather.temperature)}°C</Text>
          <Image style={styles.weatherIcon} source={{ uri: weather.icon }} />
          <Text style={styles.description}>{weather.description}</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoBlock}>
              <Image source={require('../weatherapp/image/windy.png')} />
              <Text style={styles.infoText}>{weather.windSpeed} km/h</Text>
            </View>
            <View style={styles.infoBlock}>
              <Image source={require('../weatherapp/image/humidity.png')} />
              <Text style={styles.infoText}>{weather.humidity} %</Text>
            </View>
          </View>
        </View>
      ) : (
        <Text style={styles.text}>{errorMsg ? errorMsg : 'Fetching weather...'}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  weatherCard: {
    margin: 50,
    backgroundColor: '#ffffff',
    padding: 30,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
  },
  text: {

  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  temperature: {
    fontSize: 64,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  weatherIcon: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  description: {
    fontSize: 20,
    fontStyle: 'italic',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  infoBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 18,
    marginLeft: 10,
  },
});

export default App;
