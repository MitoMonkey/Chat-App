import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity } from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet'; // hook

import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from "expo-av";
import * as Location from 'expo-location';

import firebase from 'firebase';
import firestore from 'firebase';

export default function CustomActions(props) {
    const [image, setImage] = useState(null);
    const [rec, setRec] = useState(); // CF version
    const [recording, setRecording] = useState(); // expo-av documentation version
    const [recordURI, setRecordURI] = useState();
    const [sound, setSound] = useState();
    const [location, setLocation] = useState();

    // ***** SHARE IMAGE FROM GALLERY *****
    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status === 'granted') {
                let result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                }).catch(error => console.log(error));

                if (!result.cancelled) {
                    setImage(result);
                    const imageURI = await uploadImage(result.uri);
                    props.onSend({ image: imageURI });
                }
            }
        } catch (error) {
            console.log(error.message);
        }
    };

    const takePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            
            if (status === 'granted') {
                let result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                }).catch(error => console.log(error));

                if (!result.cancelled) {
                    setImage(result);
                    const imageURI = await uploadImage(result.uri);
                    props.onSend({ image: imageURI });
                }
            }
        } catch (error) {
            console.log(error.message);
        }
    };

    // ***** RECORD AUDIO *****

    // from CF expo-snack
    const recordAudio = async () => {
        try {
            await Permissions.askAsync(Permissions.AUDIO_RECORDING);
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                interruptionModeIOS:
                    Audio.INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: false,
                interruptionModeAndroid:
                    Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
            });

            const recording = new Audio.Recording();
            await recording.prepareToRecordAsync(
                Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
            );
            await recording.startAsync();
            setRec("started recording");
            setTimeout(async () => {
                try {
                    await recording.stopAndUnloadAsync();
                    setRec("stopped recording");
                } catch (e) {
                    setRec(`error: ${e.message}`);
                }
            }, 4000); // increase to 1000 for it to work
        } catch (e) {
            setRec(`error: ${e.message}`);
            console.log(e.message);        
        }
    }
    // from https://docs.expo.dev/versions/latest/sdk/audio/
    async function startRecording() {
        try {
            console.log('Requesting permissions..');
            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });
            console.log('Starting recording..');
            const { recording } = await Audio.Recording.createAsync(
                Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
            );
            setRecording(recording);
            console.log('Recording started');
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    };
    async function stopRecording() {
        console.log('Stopping recording..');
        setRecording(undefined);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        console.log('Recording stopped and stored at', uri);
        setRecordURI(uri);
    };
    /* RENDER BLOCK FROM EXPERIMENTATION PROJECT
    <View style={styles.container}>
        {/* <Button
            title="Record"
            onPress={recordAudio}
        /> * /}
        <Button
            title={recording ? 'Stop Recording' : 'Start Recording'}
            onPress={recording ? stopRecording : startRecording}
        />
        <Text>{recordURI}</Text>
        <Button title="Play Sound" onPress={playSound(recordURI)} />
    </View >
    */

    // ***** AUDIO PLAYBACK ***** > NOT WORKING YET
    async function playSound(audioURI) {
        /* 
        try {
            if (audioURI) {
            console.log('Loading Sound');
            const { sound } = await Audio.Sound.createAsync(
                require('./assets/Djigbo_104BPM.mp3') // audioURI
            );
            setSound(sound);
            console.log('Playing Sound');
            await sound.playAsync();
            }
            else {
            console.log('No soundfile to play');
            } 
        } catch (error) {
            console.log(error.message);
        }
        */
    };
    /*   React.useEffect(() => {
        return sound
          ? () => {
            console.log('Unloading Sound');
            sound.unloadAsync();
          }
          : undefined;
      }, [sound]); */

    
      // ***** SHARE LOCATION *****
    const getLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }
            if (status === 'granted') {
                let result = await Location.getCurrentPositionAsync({}).catch((error) => console.log(error));
                if (result) {
                    setLocation(result);
                    const longitude = JSON.stringify(result.coords.longitude);
                    const altitude = JSON.stringify(result.coords.latitude);
                    props.onSend({
                        location: {
                            longitude: result.coords.longitude,
                            latitude: result.coords.latitude,
                        }
                    });
                }
            }
        } catch (error) {
            console.log(error.message);
        }
    };

    // upload image to Firestore
    const uploadImage = async (uri) => {
        const response = await fetch(uri);
        const blob = await response.blob();
        const imageNameBefore = uri.split("/");
        const imageName = imageNameBefore[imageNameBefore.length - 1];
        const ref = firebase.storage().ref().child(`images/${imageName}`);
        const snapshot = await ref.put(blob);
        return await snapshot.ref.getDownloadURL();
    };

    const { showActionSheetWithOptions } = useActionSheet();
    const onActionPress = () => {
        const options = ['Choose From Library', 'Take Picture', 'Send Location', 'Cancel'];
        const cancelButtonIndex = options.length - 1;
        showActionSheetWithOptions(
            {
                options,
                cancelButtonIndex,
            },
            async (buttonIndex) => {
                switch (buttonIndex) {
                    case 0:
                        return pickImage();
                    case 1:
                        return takePhoto();
                    case 2:
                        return getLocation();
                    // default:
                }
            },
        );
    };

    // render a round "button" with a + inside
    return (
        <TouchableOpacity 
            style={styles.container} 
            onPress={onActionPress}
            accessible={true}
            accessibilityLabel="More options"
            accessibilityHint="Let???s you choose to send an image or your geolocation."
            >
                
            <View style={[styles.wrapper, props.wrapperStyle]}>
                <Text style={[styles.iconText, props.iconTextStyle]}>+</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 26,
        height: 26,
        marginLeft: 10,
        marginBottom: 10,
    },
    wrapper: {
        borderRadius: 13,
        borderColor: '#b2b2b2',
        borderWidth: 2,
        flex: 1,
    },
    iconText: {
        color: '#b2b2b2',
        fontWeight: 'bold',
        fontSize: 16,
        backgroundColor: 'transparent',
        textAlign: 'center',
    },
});