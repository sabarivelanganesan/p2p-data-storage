import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddNetworkStorage = ({ navigation }) => {

    useEffect(() => {
        (async () => {
            const value = await AsyncStorage.getItem('connection_status');
            console.log(value);
            if (value === 'connected') {
                navigation.navigate("Network Storage");
            }
        })();
    });

  return (
    <View style={styles.container}>
      <Image source={require('../../styles/explore-network.png')} style={{ width: 100, height: 100, marginTop: 20 }} />
      <Text style={styles.titleContainer}>
        Enhance File Accessibility by Adding New Storage to the Shared Network
      </Text>
      <TouchableOpacity
        style={styles.buttonContainer}
        onPress={() => navigation.navigate("Connect Device")}
      >
        <Text style={{ color: '#fff', marginLeft: 10 }}>+ Add Network Storage</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 50, // Adjust this value as needed to set the distance from the top
  },
  titleContainer: {
    width: 360,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1053D9',
    padding: 20,
  },
  buttonContainer: {
    marginTop: 20,
    width: 200,
    backgroundColor: '#5289F8',
    borderRadius: 10,
    padding: 10,
  },
});
export default AddNetworkStorage;