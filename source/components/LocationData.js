import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ImageBackground,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import * as Location from "expo-location";
import { ImageData } from "./ImageData";
// import { useFonts } from "expo-font";
// import { AppLoading } from "expo";
import axios from "axios";

const LocationData = () => {
  const [errorMsg, setErrorMsg] = useState(null);
  const [temperature, setTemperature] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState(null);
  const [locationName, setLocationName] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getLocationAsync();
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  //   const [fontsLoaded, fontError] = useFonts({
  //     "LibreBaskerville-Bold": require("../../assets/fonts/LibreBaskerville-Bold.ttf"),
  //   });

  //   if (!fontsLoaded) {
  //     return <AppLoading />;
  //   }

  const getLocationAsync = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        setLoadingLocation(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});

      // Get location name using reverse geocoding
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // Set the location name
      setLocationName(reverseGeocode[0].city);

      // Set loadingWeather to true when starting to fetch weather
      setLoadingWeather(true);

      // Fetch temperature using OpenWeatherMap API
      const apiKey = "dcff5853c024b853d778ec7ad5ec71aa";
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${location.coords.latitude}&lon=${location.coords.longitude}&units=metric&appid=${apiKey}`
      );

      // Extract temperature from API response
      setTemperature(response.data.main.temp);

      // Determine time of day
      const currentHour = new Date().getHours();
      if (currentHour >= 6 && currentHour < 12) {
        setTimeOfDay("Morning");
      } else if (currentHour >= 12 && currentHour < 16) {
        setTimeOfDay("Afternoon");
      } else if (currentHour >= 16 && currentHour < 19) {
        setTimeOfDay("Evening");
      } else {
        setTimeOfDay("Night");
      }
    } catch (error) {
      console.error("Error getting location or temperature:", error);
      setErrorMsg("Error getting location or temperature");
    } finally {
      setLoadingLocation(false);
      // Set loadingWeather to false when the weather data is fetched
      setLoadingWeather(false);
    }
  };

  useEffect(() => {
    getLocationAsync();
  }, []);

  return (
    <ScrollView
      contentContainerStyle={styles.scrollView}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <ImageBackground
        source={{ uri: ImageData.find((item) => item.time === timeOfDay)?.img }}
        style={styles.backgroundImage}
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            <Text
              style={[
                styles.text,
                {
                  top: "-10%",
                  fontSize: 28,
                  fontWeight: "800",
                },
              ]}
            >
              Current weather
            </Text>
            {loadingLocation && (
              <ActivityIndicator size="large" color="#0000ff" />
            )}
            {loadingWeather && (
              <ActivityIndicator size="large" color="#00ff00" />
            )}
            {errorMsg && <Text style={{ color: "red" }}>{errorMsg}</Text>}
            {locationName && (
              <Text style={[styles.text]}>Location: {locationName}</Text>
            )}
            {temperature && (
              <Text style={styles.text}>Temperature: {temperature} °C</Text>
            )}
            {timeOfDay && <Text style={styles.text}>{timeOfDay}</Text>}
          </View>
        </View>
      </ImageBackground>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundImage: {
    flex: 1,
    justifyContent: "center",
  },
  overlay: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    height: "30%",
    width: "75%",
    borderRadius: 20,
    alignSelf: "center",
  },
  text: {
    color: "white",
    fontSize: 20,
  },
  scrollView: {
    flexGrow: 1,
  },
});

export default LocationData;
