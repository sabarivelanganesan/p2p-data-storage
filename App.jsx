import React, { Component } from 'react';
import SidebarScreen from './Components/SidebarScreen';
import { StatusBar } from 'react-native'
import { openDatabase } from './Components/Database';
import RNFS from 'react-native-fs';
// import { ServerConnection }  from './Components/Server';
import AsyncStorage from '@react-native-async-storage/async-storage';



export default class App extends Component {

    constructor(props) {
        super(props);
    }

    async componentDidMount() {
       try {
        await AsyncStorage.setItem('connection_status', 'not_connected');
//         console.log(await AsyncStorage.getItem('connection_status'));
        openDatabase();
        this.clearCache();
       } catch(e) {
         console.log(e);
       }
       console.log('working');
    }

    clearCache = async () => {
        try {
          const cachePath = RNFS.ExternalCachesDirectoryPath;
          const files = await RNFS.readDir(cachePath);
          for (const file of files) {
            console.log(file);
            await RNFS.unlink(file.path);
          }

          console.log('Cache cleared successfully.');
        } catch (error) {
          console.log('Error clearing cache:', error);
        }
      };

    render() {
        return (
            <>
            <StatusBar backgroundColor= '#07A9E5' />
            <SidebarScreen />
            </>
        )
    }
}

// export default App;