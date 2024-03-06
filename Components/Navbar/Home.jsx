import React, { PureComponent } from 'react';
import { View, Text, Button, Image, FlatList, ToastAndroid, StyleSheet, Dimensions, TouchableOpacity, Alert } from 'react-native';
import RNFS from 'react-native-fs';
import { insertTable, viewData } from '../Database';
// import RNFetchBlob from 'rn-fetch-blob';
import { cachedServerData, sendMessageToServer } from '../Client';
import { ServerConnection }  from '../Server';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AddNetworkStorage from '../PeersConnectionSteps/AddNetworkStorage';
import ConnectWithDevice from '../PeersConnectionSteps/ConnectWithDevice';
import NetworkStorage from '../PeersConnectionSteps/NetworkStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initialize,
  startDiscoveringPeers,
  stopDiscoveringPeers,
  subscribeOnConnectionInfoUpdates,
  subscribeOnThisDeviceChanged,
  subscribeOnPeersUpdates,
  connect,
  connectWithConfig,
  cancelConnect,
  createGroup,
  removeGroup,
  getAvailablePeers,
  sendFile,
  receiveFile,
  getConnectionInfo,
  getGroupInfo,
  receiveMessage,
  sendMessage,
} from 'react-native-wifi-p2p';

var list = [];

const MainNavigation = createStackNavigator();

export default class Home extends PureComponent<> {

    peersUpdatesSubscription;
    state = {
        deviceList: [],
        canShowDeviceList: false,
        isDeviceConnected: false,
        connectingDeviceAddress: '',
        imageUriList: [],
        connection_status: null
    }

//     componentDidMount() {
//         this.onGettingPeersUpdate();
//     }
//
//     componentWillUnmount() {
//         this.peersUpdatesSubscription?.remove();
//         console.log('Peers Removed');
//     }
    async componentDidMount() {
        console.log('componentDidMount');
        const value = await AsyncStorage.getItem('connection_status');
        console.log(value);
        this.setState({ connection_status: value });
    }

    addNewNetworkStorage = () => {
        console.log('triggered');
        this.setState({canShowDeviceList: true});
    };

    onGettingPeersUpdate = async() => {
          try {
              await initialize();
              const status = await startDiscoveringPeers();
              console.log('startDiscoveringPeers status: ', status);
              this.peersUpdatesSubscription = subscribeOnPeersUpdates(this.handleNewPeers);
          } catch (e) {
              console.error(e);
          }
    }

    onConnectingDevice = (deviceDetails) => {
      let { deviceAddress, deviceName } = deviceDetails;
      console.log('Connecting to', deviceAddress, 'device');
      ToastAndroid.show(`${deviceName} Device Connected`, ToastAndroid.SHORT);
      this.setState({connectingDeviceAddress: deviceAddress});
      connect(deviceAddress)
          .then(() => {
            this.setState({isDeviceConnected: true});
            console.log(this.state.isDeviceConnected);
            console.log('Successfully connected');
            })
          .catch(err => console.error('Something gone wrong. Details: ', err));
    }

    onSendMessage = async () => {
        sendMessageToServer('Hello I am client side message');
    };

    onReceiveMessage = () => {
        ServerConnection();
        ToastAndroid.show('Port Listening..', ToastAndroid.SHORT);
    };

    onViewData = async () => {
        try {
            let list = JSON.parse(cachedServerData);
            let uriList = [];
            for (let index=0; index<list.length; index++) {
                console.log('1');
                let { file_id, file_data, file_type } = list[index];
                let tempImagePath = `${RNFS.ExternalCachesDirectoryPath}/temp_image${file_id}.${file_type}`;
                console.log(tempImagePath);
                await RNFS.writeFile(tempImagePath, file_data, 'base64');
                uriList.push(`file://${tempImagePath}`);
            }
            this.setState({imageUriList: uriList});
        } catch (err) {
            console.log(err);
        }
    }

    onGetConnectionInfo = () => {
        getConnectionInfo()
            .then(info => console.log('getConnectionInfo', info));
    };

//  Callback Functions
    handleNewPeers = ({ devices }) => {
        console.log('working');
        this.setState({ deviceList: devices });
        console.log('Device List updated: ', this.state.deviceList);
      };

    showNavigateAlert = (navigation) => {
        Alert.alert(
            "Navigation Alert",
            "Are you sure you want to exit? The server connection will be terminated.",
            [
                {
                    text: "Back",
                    onPress: () => console.log("Cancelled"),
                    style: "cancel"
                },
                {
                    text: "End Connection",
                    onPress: async () => {
                       await AsyncStorage.setItem('connection_status', 'not_connected');
                       navigation.navigate('Explore Network Storage');
                    }
                }
            ],
            { cancelable: false }
        );
    }


    render() {
       const { canShowDeviceList, deviceList, isDeviceConnected, imageUriList, connection_status } = this.state;
       console.log(connection_status);

       return (
            <NavigationContainer>
                <MainNavigation.Navigator>
                          <>
                            <MainNavigation.Screen name='Explore Network Storage' component={AddNetworkStorage} />
                            <MainNavigation.Screen name='Connect Device' component={ConnectWithDevice} />
                            <MainNavigation.Screen
                                name='Network Storage'
                                component={NetworkStorage}
                                options={({ navigation }) => ({
                                    headerLeft: () => (
                                        <TouchableOpacity
                                            style={{ marginLeft: 15 }}
                                            onPress={() => this.showNavigateAlert(navigation)}
                                        >
                                            <Text style={{ fontSize: 30, fontWeight: 'bold', position: 'relative', top: -10 }}>{'\u2190'}</Text>
                                        </TouchableOpacity>
                                    ),
                                })}
                            />

                          </>
                </MainNavigation.Navigator>
            </NavigationContainer>
       );
     }
};