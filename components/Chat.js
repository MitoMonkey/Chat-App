import React from 'react';
import { View, Text, ScrollView  } from 'react-native';

export default class Chat extends React.Component {

    render() {
        // load the state of "name" in App.js as a prop into Chat component
        let { name } = this.props.route.params;

        // Show the name in the navigation bar
        this.props.navigation.setOptions({ title: name });

        return (
            <View>
                {/* Rest of the UI */}
                <ScrollView>
                    <Text></Text>
                </ScrollView>
            </View>
        );
    };
}