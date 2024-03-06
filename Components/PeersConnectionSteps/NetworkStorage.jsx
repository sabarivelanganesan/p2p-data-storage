import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator, StyleSheet, ToastAndroid, Alert } from 'react-native';
import { createClientConnection, cachedServerData, sendMessageToServer, isStillInprogress, closeClientConnection } from '../Client';
import { serverDetails } from './ConnectWithDevice';
import RNFS from 'react-native-fs';
import DocumentPicker from 'react-native-document-picker';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HeaderBackButton } from '@react-navigation/stack';


const NetworkStorage = ({ route, navigation }) => {

    const [imageUriList, setImageUriList] = useState([]);
    const [selectedImagesCount, setSelectedImagesCount] = useState(0);
    const [isLoading, setIsLoading ] = useState(true);
    const isFocused = useIsFocused();
    const mimeTypeToFileExtension = {
      'video/mp4': 'mp4',
      'image/jpeg': 'jpg',
      'application/pdf': 'pdf'
    };

    useEffect(() => {
//         if (isFocused) {
          const fetchData = async () => {
              try {
              const value = await AsyncStorage.getItem('final_data') || route.finalData;
//               setFinalData(JSON.parse(value));
//               console.log('----');
              onViewData(JSON.parse(value));
//                 const response = await createClientConnection();
//                 sendMessageToServer('Hello I am client side message')
//                 .then((response) => {
//                     const finalData = response;
//                     onViewData(finalData);
//                     ToastAndroid.show('Server has been Successfully Connected', ToastAndroid.LONG);
//
//                 });
              } catch (error) {
                console.error(error);
//                 ToastAndroid.show('Connection Issue', ToastAndroid.LONG);
//                 setIsLoading(false);
//                 return navigation.navigate("Connect Device");
              }
            };
            fetchData();
    }, []);

    const uploadFiles = async () => {
      console.log('On selecting File...');

      try {
        const selectedFile = await DocumentPicker.pick({
          allowMultiSelection: false
        });

        const { uri:filePath, name: fileName, type: fileType } = selectedFile[0];
//         const fileType = name.split('.')[1];
        const fileData = await RNFS.readFile(filePath, 'base64');
        console.log(typeof fileData);
        const objectTemp = [{
          file_data: fileData,
          fileName, fileName,
          fileType: fileType
        }]
        setIsLoading(true);
        sendMessageToServer(JSON.stringify(objectTemp))
        .then((response) => {
          const finalData = response;
          onViewData(finalData);
          ToastAndroid.show('File Uploaded Successfully', ToastAndroid.LONG);
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          setIsLoading(false);
        })
      } catch (err) {
        if (DocumentPicker.isCancel(err)) {
          console.log('User Cancelled the Document Selection', err);
        } else {
            console.log('Error on selecting files', err);
        }
      }
    }

    closeConnection = () => {
        Alert.alert(
        'Confirm Disconnection',
        'Are you sure you want to disconnect?',
        [
            {
                text: 'Cancel',
                onPress: () => console.log('Disconnection Cancelled'),
                style: 'cancel',
            },
            {
                text: 'OK',
                onPress: async () => {
                    await AsyncStorage.setItem('connection_status', 'not_connected');
                    closeClientConnection();
                    ToastAndroid.show('Server has been Disconnected', ToastAndroid.LONG);
                    navigation.navigate("Explore Network Storage");
                },
            },
        ],
        { cancelable: true }
    );
    }

    fetchData = () => {
        setIsLoading(true);
        sendMessageToServer('Hello I am client side message')
        .then((response) => {
            const finalData = response;
            onViewData(finalData);
            ToastAndroid.show('Reload Successfully', ToastAndroid.LONG);

        })
        .catch((error) => {
            console.log(error);
        })
        .finally(() => {
            setIsLoading(false);
        })
    }

   const onViewData = async (data) => {
        console.log('On Viewing Data', typeof data);
        await AsyncStorage.setItem('final_data', JSON.stringify(data));
        try {
            let list = data;
            let uriList = [];
            for (let index=0; index<list.length; index++) {
                let { file_id, chunks, file_type } = list[index];
                console.log(file_type);
                 let fileData = chunks.map(c => c.chunk_data).join('');
                console.log('FileData', fileData);
                let tempImagePath = `${RNFS.ExternalCachesDirectoryPath}/temp_image${file_id}.${mimeTypeToFileExtension[file_type]}`;
                console.log('tempPath', tempImagePath);
                console.log(file_type);
                await RNFS.writeFile(tempImagePath, fileData, 'base64');
                let uriObject = {
                    uri: `file://${tempImagePath}`,
                    file_id: file_id,
                    isSelected: false
                }
                uriList.push(uriObject);
            }
            setImageUriList(uriList);
        } catch (err) {
            console.log(err);
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    }

    const deleteFiles = () => {
       let selectedFilesIdsToDelete = imageUriList.filter(
         (imageItem) => imageItem.isSelected
       ).map((imageItem) => imageItem.file_id);
       console.log(selectedFilesIdsToDelete);

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
                       setSelectedImagesCount(0);
                       let d = JSON.stringify(selectedFilesIdsToDelete);
                       let r = d+'Delete';
                       console.log(r);
                        setIsLoading(true);
                        sendMessageToServer(r)
                        .then((response) => {
                            const finalData = response;
                            onViewData(finalData);
                        })
                        .catch((error) => {
                            console.log(error);
                        })
                        .finally(() => {
                            setIsLoading(false);
                            ToastAndroid.show('File Deleted Successfully', ToastAndroid.LONG);
                        })
              },
            },
          ],
          { cancelable: false }
        );
    }

    const imageSelection = (item) => {
        console.log(item);
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
        <View style={{padding: 20}}>
           {selectedImagesCount
           ? (
                  <View style={{ flexDirection: 'row', position: 'absolute', top: 20, right: 20 }}>
                      <TouchableOpacity style={{padding: 10, borderRadius: 10, backgroundColor: '#EA5611', marginLeft: 10}} onPress={deleteFiles}>
                         <Text> Delete </Text>
                      </TouchableOpacity>

                  </View>
           )
           :(
               <View style={{ flexDirection: 'row', position: 'absolute', top: 20, right: 20 }}>
                   <TouchableOpacity style={{padding: 10, borderRadius: 10, backgroundColor: 'gray'}} onPress={fetchData}>
                      <Text style={{color: '#fff'}}> Reload </Text>
                   </TouchableOpacity>
                   <TouchableOpacity style={{padding: 10, borderRadius: 10, backgroundColor: '#8CE1EE', marginLeft: 10, marginRight: 10}} onPress={uploadFiles}>
                      <Text> + Upload files </Text>
                   </TouchableOpacity>
                   <TouchableOpacity style={{padding: 10, borderRadius: 10, backgroundColor: '#EA5611'}} onPress={closeConnection}>
                      <Text> Disconnect </Text>
                   </TouchableOpacity>

               </View>
           )
           }

          <View style={{ marginTop: 30, padding: 20 }}>
            {isLoading ? (
              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={{marginLeft: 10}}> Please Wait ...</Text>
              </View>
            ) : (
                imageUriList.length ? (
                <FlatList
                  data={imageUriList}
                  keyExtractor={(item, index) => index.toString()}
                  numColumns={3}
                  renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => imageSelection(item)}>
                      <View style={styles.imageContainer}>
                        <Image source={{ uri: item.uri }} style={{ width: 100, height: 100, marginTop: 20 }} />
                        {item.isSelected && (
                          <View style={{ width: '100%', height: '100%', marginTop: 20, backgroundColor: 'rgba(0, 0, 0, 0.5)', position: 'absolute' }}>
                            <Text style={{ fontSize: 26, textAlign: 'center', fontWeight: 'bold', marginTop: '23%', color: '#fff' }}>✓</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  )}
                />
                ) : (
                <View style={{ alignItems: 'center' }}>
                    <Image source={require('../../styles/no-files.png')} style={{ width: 100, height: 100, marginTop: 80 }} />
                    <Text style={{ fontSize: 26, textAlign: 'center', fontWeight: 'bold', marginTop: '10%',marginLeft: '5%', color: 'black' }}>No Files..</Text>
                  </View>
                )
            )}
          </View>
        </View>
    )
}

const styles = StyleSheet.create({
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    right: 25,
    zIndex: 1
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
    noFilesFromServer: {
    position: 'absolute'

    }
})

export default NetworkStorage;