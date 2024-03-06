import React, { PureComponent } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  FlatList,
  TouchableOpacity,
  Modal
} from 'react-native';

import {
  initialize,
  startDiscoveringPeers,
  stopDiscoveringPeers,
  subscribeOnConnectionInfoUpdates,
  subscribeOnThisDeviceChanged,
  subscribeOnPeersUpdates,
  connect,
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

import DocumentPicker from 'react-native-document-picker'
import { PermissionsAndroid } from 'react-native';
import RNFS from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob';

type Props = {};

export default class Peers extends PureComponent<Props> {
    peersUpdatesSubscription;
    connectionInfoUpdatesSubscription;
    thisDeviceChangedSubscription;

    state = {
        deviceList: [],
        isSender: false,
        isReceiver: false,
        selectedDocuments: [],
        isOptionsVisible: false
    };

//  Mount component
    async componentDidMount() {
      try {
          await initialize();
          const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
              {
                  'title': 'Access to wi-fi P2P mode',
                  'message': 'ACCESS_COARSE_LOCATION'
              }
          );

          console.log(granted === PermissionsAndroid.RESULTS.GRANTED ? "You can use the p2p mode" : "Permission denied: p2p mode will not work");

          this.peersUpdatesSubscription = subscribeOnPeersUpdates(this.handleNewPeers);
          this.connectionInfoUpdatesSubscription = subscribeOnConnectionInfoUpdates(this.handleNewInfo);
          this.thisDeviceChangedSubscription = subscribeOnThisDeviceChanged(this.handleThisDeviceChanged);

          const status = await startDiscoveringPeers();
          console.log('startDiscoveringPeers status: ', status);
      } catch (e) {
          console.error(e);
      }
    }

//  Unmount Component
    componentWillUnmount() {
        this.peersUpdatesSubscription?.remove();
        this.connectionInfoUpdatesSubscription?.remove();
        this.thisDeviceChangedSubscription?.remove();
    }

//  Callback Functions
    handleNewPeers = ({ devices }) => {
        this.setState({ deviceList: devices });
        console.log('Device List updated: ', this.state.deviceList);
      };

    handleNewInfo = (info) => {
        console.log('OnConnectionInfoUpdated', info);
    };

    handleThisDeviceChanged = (groupInfo) => {
        console.log('THIS_DEVICE_CHANGED_ACTION', groupInfo);
    };

//  UI Functions
    onConnectingDevice = (deviceDetails) => {
      let { deviceAddress, deviceName } = deviceDetails;
      console.log('Connecting to', deviceAddress, 'device');
      connect(deviceAddress)
          .then(() => console.log('Successfully connected'))
          .catch(err => console.error('Something gone wrong. Details: ', err));
    }

    onCancelConnect = () => {
      cancelConnect()
          .then(() => console.log('cancelConnect', 'Connection successfully canceled'))
          .catch(err => console.error('cancelConnect', 'Something gone wrong. Details: ', err));
    };


    onSelectingDocuments = async () => {
      console.log('On selecting Document...');
      try {
        const newSelectedDocuments = await DocumentPicker.pick({
          allowMultiSelection: true
        });
        this.setState({ selectedDocuments: newSelectedDocuments });
        console.log('Selected Documents:', this.state.selectedDocuments);
      } catch (err) {
        if (DocumentPicker.isCancel(err)) {
          console.log('User Cancelled the Document Selection', err);
        } else {
        console.log('Not gone through :(');
          console.log(err);
        }
      }
    }

    sendingFile = async(file) => {
        let { uri, name } = file;
        let filePath;

         try {
              const { path } = await RNFetchBlob.fs.stat(uri);
              console.log(path);
          } catch (err) {
            if (DocumentPicker.isCancel(err)) {
              console.log('User cancelled file picking');
            } else {
              console.log('Error', err);
            }
          }
    }

    onCreateGroup = () => {
      createGroup()
          .then(() => console.log('Group created successfully!'))
          .catch(err => console.error('Something gone wrong. Details: ', err));
    };

    onRemoveGroup = () => {
      removeGroup()
          .then(() => console.log('Currently you don\'t belong to group!'))
          .catch(err => console.error('Something gone wrong. Details: ', err));
    };

    onGetConnectionInfo = () => {
        getConnectionInfo()
            .then(info => console.log('getConnectionInfo', info));
    };

    onSendFile = async () => {
//       const url = '/storage/emulated/0/Android/media/com.whatsapp/WhatsApp/Media/WhatsApp Animated Gifs/VID-20230617-WA0005.mp4';
      let firstDocument = this.state.selectedDocuments[0];
      let { uri, name } = firstDocument;
      let { path: filePath } = await RNFetchBlob.fs.stat(uri);
//
//
      console.log('Selected File Path: ', filePath);
//       try {
//         let sendStatus = await sendFile(url)
//         console.log('File sent successfully', sendStatus)
//       } catch (error) {
//         console.log('Error while file sending', error);
//       }

      PermissionsAndroid.request(
                  PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                  {
                      'title': 'Access to read',
                      'message': 'READ_EXTERNAL_STORAGE'
                  }
              )
          .then(granted => {
              if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                  console.log("You can use read operation")
              } else {
                  console.log("Read operation permission denied")
              }
          })
          .then(() => {
              return PermissionsAndroid.request(
                  PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                  {
                      'title': 'Access to write',
                      'message': 'WRITE_EXTERNAL_STORAGE'
                  }
              )
          })
          .then(() => {
              return sendFile(filePath)
                  .then((metaInfo) => console.log('File sent successfully:', metaInfo))
                  .catch(err => console.log('Error while file sending', err));
          })
          .catch(err => console.log(err));

    };

    onReceiveFile = () => {
        PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
              'title': 'Access to read',
              'message': 'READ_EXTERNAL_STORAGE'
          }
      )
          .then(granted => {
              if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                  console.log("You can use the storage")
              } else {
                  console.log("Storage permission denied")
              }
          })
          .then(() => {
              return PermissionsAndroid.request(
                  PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                  {
                      'title': 'Access to write',
                      'message': 'WRITE_EXTERNAL_STORAGE'
                  }
              )
          })
          .then(() => {
              let  url = '/storage/emulated/0/Download/';
              return receiveFile(url, 'New.jpg')
                  .then(() => console.log('File received successfully'))
                  .catch(err => console.log('Error while file receiving', err))
          })
          .catch(err => console.log(err));
    };

//  UI Section

    render() {
        let { isSender, isReceiver, deviceList, selectedDocuments } = this.state;
        return (
            <View style={styles.container}>
                 {console.log(deviceList)}
                 <FlatList
                   data = {deviceList}
                   renderItem = {({ item }) => (
                     <View style={{ marginTop: 20, borderRadius: 2 }}>
                        <Button onPress={() => this.onConnectingDevice(item)} title={item.deviceName} />
                      </View>
                   )}
                   style={{width: '40%'}}
                 />
                 <View style={{marginTop: 30}}>
                    <View style={{padding: 10}}>
                        <Button
                          title="Create group"
                          onPress={this.onCreateGroup}
                          color= 'green'
                        />
                    </View>
                    <View style={{padding: 10}}>
                        <Button
                          title="Remove group"
                          onPress={this.onRemoveGroup}
                          color= 'red'
                        />
                    </View>

                    <View style={{padding: 10}}>
                        <Button
                          title="Get connection Info"
                          onPress={this.onGetConnectionInfo}
                          color = '#C31689'
                        />
                    </View>
                 </View>

                 {!isSender && !isReceiver ? (
                    <View>
                      <View style={{ width: 140, padding: 10, alignContent: 'center' }}>
                        <Button
                          onPress={ () => this.setState({ isSender: true }) }
                          title="Send"
                          color="blue"
                          accessibilityLabel="Send Message"
                        />
                      </View>
                      <View style={{ width: 140, padding: 10, alignContent: 'center' }}>
                        <Button
                          onPress={ () => this.setState({ isReceiver: true }) }
                          title="Receive"
                          color="grey"
                          accessibilityLabel="Receive message"
                        />
                      </View>
                    </View>
                 ) : null}

                 {isSender && (
                    <View>
                        <Text style={{textAlign: 'center', marginHorizontal: 40}}>Share Documents</Text>
                    <View>
                    <TouchableOpacity >
                      <Button onPress={this.onSelectingDocuments} title='Select' />
                    </TouchableOpacity>

                    <View>
                       <FlatList
                         data={selectedDocuments}
                           renderItem={({ item }) => (
                             <View style={{marginTop: 20, width: '40%'}}>
                                <Button onPress={() => this.sendingFile(item)} title={item.name} color='#8416C3' />
                             </View>
                           )}
                       />
                    </View>
                        <View style={{padding: 10, width: 140}}>
                            <Button
                              title="Send file"
                              onPress={this.onSendFile}
                              color= '#1630C3'
                            />
                        </View>
                        <View style={{padding: 10, width: 140}}>
                        <Button
                          title="Cancel connect"
                          onPress={this.onCancelConnect}
                          color='red'
                        />
                        </View>

                  </View>
                  </View>
                )}

                {isReceiver && (
                  <View>
                    <Text style={{textAlign: 'center', marginHorizontal: 40}}>Receiving Documents...</Text>
                    <View style={{padding: 10, width: 140}}>
                      <Button
                        title="Receive file"
                        onPress={this.onReceiveFile}
                        color= '#6E6F07'
                      />
                    </View>
                  </View>
                )}

            </View>
        )
    }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5FCFF',
    width: '80%',
    alignContent: 'center',
    justifyContent: 'center'
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});