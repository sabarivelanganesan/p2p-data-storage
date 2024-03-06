import React, {useRef, useState} from 'react';
import {
  Button,
  DrawerLayoutAndroid,
  Text,
  StyleSheet,
  View,
  TouchableOpacity
} from 'react-native';
import Home from './Navbar/Home';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import RenderComponent from './RenderComponent';

const mainNavigation = createStackNavigator();

const SidebarScreen = () => {
  const drawer = useRef(null);
  const [drawerPosition, setDrawerPosition] = useState('left');
  const [activeComponent, setActiveComponent] = useState('Home');

  const changeDrawerPosition = () => {
    if (drawerPosition === 'left') {
      setDrawerPosition('right');
    } else {
      setDrawerPosition('left');
    }
  };

  const handleMenuPress = (componentName) => {
    setActiveComponent(componentName);
    drawer.current.closeDrawer();
  };

  const navigationView = () => (
    <View style={[styles.container, styles.navigationContainer]}>
        <Text style={styles.optionHeading}>MOBILE DATAHUB</Text>
        <Text style={styles.horizontalLine}></Text>
        <TouchableOpacity
          onPress={() => handleMenuPress('Home')}
        >
          <Text style={[styles.optionText, activeComponent === 'Home' && styles.activeOption]}>HOME</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleMenuPress('Files')}
        >
          <Text style={[styles.optionText, activeComponent === 'Files' && styles.activeOption]}>FILES</Text>
        </TouchableOpacity>
    </View>
  );

  return (
    <DrawerLayoutAndroid
      ref={drawer}
      drawerWidth={300}
      drawerPosition={drawerPosition}
      renderNavigationView={navigationView}>
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.button]}
          onPress={() => drawer.current.openDrawer()}
        >
          <Text style={styles.buttonText}>☰</Text>
        </TouchableOpacity>
        <RenderComponent activeComponent={activeComponent} />
      </View>
    </DrawerLayoutAndroid>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navigationContainer: {
    backgroundColor: '#2268EA',
  },
  optionHeading: {
    color: '#E4F9EE',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center'
  },
  optionText: {
    color: '#ffff',
    fontSize: 18,
    padding: 15,
    paddingLeft: 30
  },
  activeOption: {
    backgroundColor: '#02AC8A',
    fontWeight: 'bold',
  },
  buttonText: {
    color: 'grey',
    fontSize: 24,
    padding: 16
  },
  horizontalLine: {
      borderBottomColor: '#CCCCCC',
      borderBottomWidth: 1,
//       marginVertical: 10,
//       marginBottom: 40
  }
});

export default SidebarScreen;

//         <TouchableOpacity
//           onPress={() => handleMenuPress('Peers')}
//         >
//           <Text style={[styles.optionText, activeComponent === 'Peers' && styles.activeOption]}>PEERS</Text>
//         </TouchableOpacity>
//
//         <TouchableOpacity
//           onPress={() => handleMenuPress('Settings')}
//         >
//           <Text style={[styles.optionText, activeComponent === 'Settings' && styles.activeOption]}>SETTINGS</Text>
//         </TouchableOpacity>
