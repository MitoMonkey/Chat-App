// import { StatusBar } from 'expo-status-bar';
import React, {Component} from 'react';
// import { StyleSheet, Text, View } from 'react-native';

import Start from './components/Start';
import Chat from './components/Chat';

import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Create the navigator
const Stack = createStackNavigator();

export default class ChatApp extends Component {
  
  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Start"
          screenOptions={{
            headerTitleAlign: 'center',
            headerTintColor: 'white',
            headerStyle: {
              backgroundColor: 'orange'
            },
          }}
        >
          <Stack.Screen
            name="Start"
            component={Start}
            navigationOptions= {{
              //hide navigation bar on Start screen
              headerShown: false,
              }}
          />
          <Stack.Screen
            name="Chat"
            component={Chat}
            options={({ route }) => ({ title: route.params.name  })} // set the name that the user enters on Start.js as the title for Chat.js
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}

