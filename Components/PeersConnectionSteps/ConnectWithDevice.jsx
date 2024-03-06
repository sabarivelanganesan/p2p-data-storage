import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, FlatList, StyleSheet, ToastAndroid } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { createClientConnection, cachedServerData, sendMessageToServer, isStillInprogress } from '../Client';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
     createTableForServerDetails,
     insertTableForServerDetails,
     viewDataForServerDetails
     } from '../Database';
export const serverDetails = {};

const ConnectWithDevice = ({ navigation }) => {
    const [connectMode, setConnectMode] = useState('manual');
    const [ipAddress, setIpAddress] = useState('');
    const [port, setPort] = useState('');

    useEffect(() => {
        createTableForServerDetails();
    }, []);


    const toggleConnectMode = (mode) => {
      setConnectMode(mode);
    };

    const handleIpAddressChange = (text) => {
        setIpAddress(text);
    };

    const handlePortChange = (text) => {
        setPort(text);
    };

    const handleConnect = async () => {
       console.log('IP Address:', ipAddress);
       console.log('Port:', port);
       serverDetails.ipAddress = ipAddress;
       serverDetails.port = port;

         try {
           const response = await createClientConnection();
           sendMessageToServer('Hello I am client side message')
           .then(async (response) => {
               const finalData = response;
               await AsyncStorage.setItem('final_data', JSON.stringify(finalData));
               ToastAndroid.show('Server has been Successfully Connected', ToastAndroid.LONG);
               return navigation.navigate("Network Storage", { finalData: finalData });
           });
           await AsyncStorage.setItem('connection_status', 'connected');
         } catch (error) {
           console.error(error);
           ToastAndroid.show('Connection Issue', ToastAndroid.LONG);
//            setIsLoading(false);
           return navigation.navigate("Connect Device");
         }
    };

    const handleQRCodeScan = async ({ data }) => {
        try {
          console.log(data);
          let connectionDetails = data.split(':');
          serverDetails.ipAddress = connectionDetails[0];
          serverDetails.port = connectionDetails[1];
//           navigation.navigate("Network Storage");
           const response = await createClientConnection();
           sendMessageToServer('Hello I am client side message')
           .then(async (response) => {
               const finalData = response;
               await AsyncStorage.setItem('final_data', JSON.stringify(finalData));
               ToastAndroid.show('Server has been Successfully Connected', ToastAndroid.LONG);
               return navigation.navigate("Network Storage", { finalData: finalData });
           });
           await AsyncStorage.setItem('connection_status', 'connected');
        } catch (error) {
          console.error('Error parsing scanned QR code data:', error);
         ToastAndroid.show('Connection Issue', ToastAndroid.LONG);
         setIsLoading(false);
         return navigation.navigate("Connect Device");
        }
    };

    return (
//          <View style={styles.container}>
//               <Text style={styles.label}>Server Name:</Text>
//
        <View style={styles.container}>
            <View style={styles.toggleButtons}>
                <TouchableOpacity
                  style={[styles.toggleButton, connectMode === 'manual' && styles.activeToggleButton]}
                  onPress={() => toggleConnectMode('manual')}
                >
                  <Text>Connect Manually</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleButton, connectMode === 'qrcode' && styles.activeToggleButton]}
                  onPress={() => toggleConnectMode('qrcode')}
                >
                  <Text>Connect with QR Code</Text>
                </TouchableOpacity>
              </View>

              {connectMode === 'manual' && (
                <>
                <View>
                   <Text style={styles.label}>Server IP Address:</Text>
                   <TextInput
                    style={[styles.input, styles.ipAddress]}
//                  value='10.6.201.156'
                    value={ipAddress}
                    onChangeText={handleIpAddressChange}
                    keyboardType="default"
                   />
                   <Text style={styles.label}>Server Port:</Text>
                   <TextInput
                    style={[styles.input, styles.port]}
                    value={port}
                    onChangeText={handlePortChange}
                    keyboardType="numeric"
                   />
                  {/* Other input fields for IP Address and Port */}
                </View>
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <TouchableOpacity style={[styles.button, styles.connectButton]} onPress={handleConnect}>
                      <Text>Connect</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => navigation.navigate("Explore Network Storage")}>
                      <Text>Cancel</Text>
                  </TouchableOpacity>
                </View>
                </>
              )}

              {connectMode === 'qrcode' && (
                  <>
                    <View style={styles.qrScannerContainer}>
                        <QRCodeScanner
                            onRead={handleQRCodeScan}
                            cameraStyle={styles.cameraStyle}
                        />
                    </View>
                  </>
              )}
        </View>
    )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  port: {
    width: 190
  },
  ipAddress: {
    width: 300
  },
  button: {
    marginTop: 20,
    borderRadius: 10,
    padding: 10,
    paddingRight: 20,
    paddingLeft: 20,
    height: 40
  },
  connectButton: {
    backgroundColor: '#5289F8',
    marginRight: 20
  },
  cancelButton: {
    backgroundColor: '#fffff',
    borderWidth: 1,
    borderColor: '#CACDCD'
  },
  toggleButtons: {
      flexDirection: 'row',
      marginBottom: 20,
    },
    toggleButton: {
      flex: 1,
      alignItems: 'center',
      padding: 10,
      borderColor: '#ccc',
      borderWidth: 1,
    },
    activeToggleButton: {
      backgroundColor: '#5289F8',
      borderColor: '#5289F8',
      color: 'white',
    },
    qrScannerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        left: '20%'
    },
    cameraStyle: {
        height: 300,
        width: 400,

    },
});
export default ConnectWithDevice;