import React from 'react';
import { View, Text } from 'react-native';
import Home from './Navbar/Home';
import Files from './Navbar/Files';
import Peers from './Navbar/Peers';
import Settings from './Navbar/Settings';
import { NavigationContainer } from '@react-navigation/native';

const RenderComponent = ({ activeComponent }) => {
    switch (activeComponent) {
      case 'Home':
        return <Home />;
      case 'Files':
        return (
            <NavigationContainer>
                <Files />
            </NavigationContainer>
        );
      case 'Peers':
        return <Peers />;
      case 'Settings':
        return <Settings />;
      default:
        return null;
    }
}

export default RenderComponent;