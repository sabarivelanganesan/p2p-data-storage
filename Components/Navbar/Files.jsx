import React, { useEffect, useState } from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet, FlatList, Image, ToastAndroid, Alert, ScrollView   } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import { insertTable, viewData, deleteRowsByIds } from '../Database';
import { ServerConnection, stopServer, didServerStarted }  from '../Server';
import RNFetchBlob from 'rn-fetch-blob';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import NetInfo from '@react-native-community/netinfo';
import DeviceInfo from 'react-native-device-info';
import QRCode from 'react-native-qrcode-svg';
import Icon from 'react-native-vector-icons/FontAwesome';

const FileNavigation = createBottomTabNavigator();

function FileUploadedTabs() {
    return (
        <FileNavigation.Navigator>
            <FileNavigation.Screen name="UploadedFiles" component={UploadedFiles} />
            <FileNavigation.Screen name="ServerFiles" component={ServerFiles} />
        </FileNavigation.Navigator>
    )
}

const UploadedFiles = () => {

    const [imageUriList, setImageUriList] = useState([]);
    const [selectedImagesCount, setSelectedImagesCount] = useState(0);
    const [deviceUniqueId, setDeviceUniqueId] = useState('');

    useEffect(() => {
        const getDeviceUniqueId = async () => {
            try {
                 const deviceUniqueId = await DeviceInfo.getUniqueId();
                 setDeviceUniqueId(deviceUniqueId);
            } catch (error) {
                console.log('Error retrieving Unique Id:', error);
            }
        };
        getDeviceUniqueId();
        viewUploadFiles();
    }, []);

    const uploadFiles = async () => {
      console.log('On selecting File...');

      try {
        const selectedFiles = await DocumentPicker.pick({
          allowMultiSelection: true
        });

        for (const selectedFile of selectedFiles) {
          const { uri: filePath, name: fileName, type: fileType } = selectedFile;
          const fileData = await RNFS.readFile(filePath, 'base64');
          console.log(fileName, fileType);
          insertTable(fileData, fileName, fileType);
        }
        viewUploadFiles();
        ToastAndroid.show('File Uploaded Successfully', ToastAndroid.LONG);

      } catch (err) {
        if (DocumentPicker.isCancel(err)) {
          console.log('User Cancelled the Document Selection', err);
        } else {
            console.log('Error on selecting files', err);
        }
      }
    }

    const reloadUploadedPage = async () => {
        viewUploadFiles();
    }

    const mimeTypeToFileExtension = {
      'video/mp4': 'mp4',
      'image/jpeg': 'jpg',
      'application/pdf': 'pdf'
    };

    const deleteFiles = () => {
           let selectedFilesIdsToDelete = imageUriList.filter(
             (imageItem) => imageItem.isSelected
           ).map((imageItem) => imageItem.file_id);
//            console.log(selectedFilesIdsToDelete);
            Alert.alert(
               'Confirm Deletion',
               'Are you sure you want to delete the selected file(s)?',
               [
                 {
                   text: 'Cancel',
                   onPress: () => console.log('Cancel Pressed'),
                   style: 'cancel',
                 },
                 {
                   text: 'OK',
                   onPress: () => {
                     console.log(selectedFilesIdsToDelete);
                     deleteRowsByIds(selectedFilesIdsToDelete);
                     setSelectedImagesCount(0);
                     viewUploadFiles();
                     ToastAndroid.show('File Deleted Successfully', ToastAndroid.LONG);
                   },
                 },
               ],
               { cancelable: false }
             );
//            deleteRowsByIds(selectedFilesIdsToDelete);
//            setSelectedImagesCount(0);
//            viewUploadFiles();
//            ToastAndroid.show('File Deleted Successfully', ToastAndroid.LONG);
    }

    const viewUploadFiles = async () => {
        try {
            console.log('Working on the files');
            let result = await viewData();
            let uriList = [];

            for (let index=0; index<result.length; index++) {
                let { file_id, chunks, file_name, file_type } = result[index];
//                 console.log('FileId', file_id);
//                 let chunks = await fetchChunksForFile(file_id); // Implement this function
                let fileData = chunks.map(c => c.chunk_data).join('');

                console.log(mimeTypeToFileExtension[file_type]);
                let tempImagePath = `${RNFS.ExternalCachesDirectoryPath}/${deviceUniqueId}${file_id}.${mimeTypeToFileExtension[file_type]}`;
                await RNFS.writeFile(tempImagePath, fileData, 'base64');
                let uriObject = {
                    uri: `file://${tempImagePath}`,
                    file_id: file_id,
                    file_name, file_name,
                    file_type: file_type,
                    isSelected: false
                }
                uriList.push(uriObject);
            }
            setImageUriList(uriList);
        } catch (err) {
            console.log(err);
        }
    }

    const imageSelection = (item) => {
        console.log('Image selection');
        const updatedImageUriList = imageUriList.map((imageItem) =>
          imageItem.file_id === item.file_id
            ? { ...imageItem, isSelected: !item.isSelected }
            : imageItem
        );

        const selectedImagesCount = updatedImageUriList.filter((imageItem) => imageItem.isSelected).length;
        setSelectedImagesCount(selectedImagesCount);

        setImageUriList(updatedImageUriList);
    }

    return (
        <View style={styles.container}>
          <View style={styles.buttonContainer}>
            {selectedImagesCount
            ? (
                <TouchableOpacity onPress={deleteFiles}>
                    <Image source={require('../../styles/deleteIcon.png')} style={{width: 60, height: 60}}/>
                </TouchableOpacity>
              )
            : (
                <>
                <TouchableOpacity onPress={uploadFiles}>
                    <Image source={require('../../styles/addfiles.png')} style={{width: 60, height: 60}}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={reloadUploadedPage}>
                    <Image source={require('../../styles/reload.png')} style={{width: 60, height: 60}}/>
                </TouchableOpacity>
                </>
              )
            }
          </View>
          <View style={{marginTop: 10, flex: 1}}>
               <FlatList
                 data={imageUriList}
                 keyExtractor={(item, index) => index.toString()}
                 numColumns={3}
                 renderItem={({ item }) => (
                     <TouchableOpacity onPress={() => imageSelection(item)}>
                        <View style={styles.imageWrapper}>
                         <View style={styles.imageContainer}>
                             <Image source={{ uri: item.uri }} style={{ width: 100, height: 100, marginTop: 20 }} />
                               {item.isSelected && <View style={{width: '100%', height: '100%', marginTop: 20, backgroundColor: 'rgba(0, 0, 0, 0.5)', position: 'absolute' }}>
                                 <Text style={{fontSize: 26, textAlign: 'center', fontWeight: 'bold', marginTop: '23%', color: '#fff'}}>✓</Text>
                               </View>}
                         </View>
                         <Text style={styles.imageLabel}>{item.file_name}</Text>
                         </View>
                     </TouchableOpacity >
                 )}
               />
          </View>
        </View>
    )
}

const ServerFiles = () => {
    var [canShowServerStart, setCanShowServerStart] = useState(!didServerStarted);
    var [ipAddress, setIPAddress] = useState('');

    useEffect(() => {
        const fetchIPAddress = async () => {
          try {
            const connectionInfo = await NetInfo.fetch();
            const ipAddress = connectionInfo.details.ipAddress;
            setIPAddress(ipAddress);
          } catch (error) {
            console.log('Error retrieving IP address:', error);
          }
        };

        fetchIPAddress();
    }, []);

    const serverFiles = () => {
        ServerConnection(ipAddress);
        setCanShowServerStart(false);
    }
    const stopServerConnection = () => {
        stopServer();
        setCanShowServerStart(true);
    }
    const qrCodeData = `${ipAddress}:3001`;
    return (
        <>
        <View style={styles.centerContainer}>
            {canShowServerStart
            ?(
                <>
                <Image source={require('../../styles/server.png')} style={styles.serverImage} />
                <TouchableOpacity style={{backgroundColor: 'green', padding: 10, borderRadius: 10, marginTop: 80}} onPress={serverFiles}>
                     <Text>Start Server</Text>
                </TouchableOpacity>
                 </>
            )
            :(
                <>
                    <QRCode
                        value={qrCodeData}
                        size={200} // Specify the size of the QR code
                    />
                    <Text style={{fontWeight: 'bold'}}> {ipAddress} </Text>
                    <Text style={{fontWeight: 'bold', marginBottom: 10}}> Port: 3001 </Text>
                    <TouchableOpacity style={{backgroundColor: 'red', padding: 10, borderRadius: 10, marginTop: 10}} onPress={stopServerConnection}>
                       <Text>Stop Server</Text>
                    </TouchableOpacity>
                </>
            )
            }
        </View>
        </>
    )
}

const Files = () => {
    return (
        <FileUploadedTabs />
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingLeft: 20,
    borderColor: 'black'
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    right: 25,
    zIndex: 1
  },
      centerContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          top: -100
      },
      serverImage: {
          width: 200,
          height: 200,
      },
  serverFiles: {
//     position: 'absolute',
//     top: 30,
//     right: 20,
//     width: 90,
//     marginTop: 15
    width: 150,
    alignContent: 'center',
    justifyContent: 'center'
  },
  horizontalLine: {
    borderBottomColor: '#CCCCCC',
    borderBottomWidth: 1,
    marginTop: 30
  },
    imageContainer: {
      width: 100,
      height: 100,
      margin: 5,
      position: 'relative',
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    selectionIndicator: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 1.5)',
    },
    imageWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15
    },
        imageLabel: {
        marginTop: 15,
        fontSize: 9,
        width: 90,
        fontWeight: 'bold',
        textAlign: 'center'
    },
})

export default Files;