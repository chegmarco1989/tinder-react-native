import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, TextInput, ImageBackground, Switch } from 'react-native';
import { Container, Content, Picker } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import  {connect} from 'react-redux';
import styles from '../styles/Profile-Update-style.js'
import {uploadImage, deleteImage, updateProfile, changeShowOption, changeGender, changeLocation, showNotification} from '../redux/actions.js';
import Geohash from 'latlon-geohash';
import Geocode from "react-geocode";

export class ProfileUpdate extends React.Component {

    state = {
        aboutMe: this.props.user.aboutMe,
        birth: this.props.user.birth,
        gender: this.props.user.gender,
        loc: 'some loc'
    }

    /*Helper function to find the object in array which has state as long_name. */
    findStateFromArray(address){
        var addressArray = address.results[0].address_components;
        var stateUS = '';
        addressArray.forEach(function(item){
            if(item.types[0] === 'administrative_area_level_1' ){
                stateUS = item.long_name;
            }
        });
        return stateUS;
    }

    /*Set parameter in navigation and get geocode, transform it to state. */
    componentDidMount(){
        console.log('update-profile page componentDidMount...');
        this.props.navigation.setParams({saveFn: () => this.saveInfo()});
        const {lat,lon} = Geohash.decode(this.props.user.geocode);
        var stateUS = '';
        Geocode.fromLatLng(lat,lon).then((response) => {
            if(response.status == 'OK'){
                stateUS = this.findStateFromArray(response);
                console.log(stateUS);
                this.setState({loc: stateUS});
            }else if(response.status == 'OVER_QUERY_LIMIT'){
                setTimeout(function(){ alert("QUERY LIMIT exceeds, wait..."); }, 3000);
            }
        }).catch((error) => {
            console.error(error);
        })
    }

    /*When user chose a different state location,
      this function is triggered and update selectedValue to new state location.*/
    componentWillReceiveProps(nextProps){
        console.log('profile-update page componentWillReceiveProps...');
        if(nextProps.stateUS){
            this.setState({loc: nextProps.stateUS});
        }

    }

    /*function triggered when user press 'finish' button*/
    saveInfo = () => {
        this.props.dispatch(updateProfile(this.state.aboutMe, this.state.birth));
    }

    /*Set up text in header*/
    static navigationOptions = ({navigation}) => {
        const {params} = navigation.state;
        return {
            title: 'update profile',
            headerRight: (
                <TouchableOpacity style={styles.headerButton} onPress={() => params.saveFn()}>
                    <Text style={styles.headerButtonText}>Finish</Text>
                </TouchableOpacity>
            )
        }
    }

    render() {
        return (
            <ScrollView>
                <View style={{flex:1}}>
                    <View style={styles.imageRow}>
                        {this.props.user.images.map((uri) => {
                            return(
                                <TouchableOpacity key={{uri}} >
                                    <ImageBackground style={styles.profileImage} source={{uri: uri}}>
                                        <Ionicons name='ios-close-circle' size={30} style={styles.deleteImageButton} onPress={() => this.props.dispatch(deleteImage(uri, this.props.user.images))}/>
                                    </ImageBackground>
                                </TouchableOpacity>
                            )
                        })}
                        <TouchableOpacity style={styles.addImage} onPress={() => this.props.dispatch(uploadImage(this.props.user.images))}>
                            <Ionicons name='ios-add-circle-outline' size={60}/>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.aboutMe}>About Me</Text>
                    <TextInput style={styles.inputBox}
                                onChangeText={(text) => this.setState({aboutMe: text})}
                                placeholder={this.props.user.aboutMe === ' '? 'add about me': this.props.user.aboutMe}
                                defaultValue = {this.props.user.aboutMe}
                                multiline={true}
                                numberOfLines={4}>
                    </TextInput>

                    <Text style={styles.genderText}>Gender</Text>
                    <Container style = {styles.genderBox}>
                        <Content>
                            <Picker
                                iosHeader="add gender"
                                mode = "dropdown"
                                placeholder={this.props.user.gender === ' '? 'add gender': this.props.user.gender}
                                selectedValue={this.props.user.gender}
                                onValueChange={(itemValue, itemIndex) => this.props.dispatch(changeGender(itemValue))}>
                                <Picker.Item label="male" value="male" />
                                <Picker.Item label="female" value="female" />
                            </Picker>
                        </Content>
                        <Ionicons name='ios-arrow-dropright' size={30} style={{position: 'absolute', right:5,bottom:5}}/>
                     </Container>

                     <Text style={styles.genderText}>Birth Year</Text>
                     <TextInput style={styles.birthBox}
                                 onChangeText={(text) => this.setState({birth: text})}
                                 placeholder={this.props.user.birth === ''? 'add birth year': this.props.user.birth}
                                 defaultValue = {this.props.user.age}
                                 placeholderTextColor='#a3a3a3'>
                     </TextInput>

                     <Text style={styles.genderText}>Location</Text>
                     <Container style = {styles.genderBox}>
                         <Content>
                             <Picker
                                 iosHeader="add location"
                                 mode = "dropdown"
                                 placeholder={'add location'}
                                 selectedValue={this.state.loc}
                                 onValueChange={(itemValue, itemIndex) => this.props.dispatch(changeLocation(itemValue))}>
                                 <Picker.Item label="Illinois" value="Illinois" />
                                 <Picker.Item label="Wisconsin" value="Wisconsin" />
                                 <Picker.Item label="Indiana" value="Indiana" />
                                 <Picker.Item label="California" value="California" />
                                 <Picker.Item label="Washington" value="Washington" />
                                 <Picker.Item label="New York" value="New York" />

                             </Picker>
                         </Content>
                         <Ionicons name='ios-arrow-dropright' size={30} style={{position: 'absolute', right:5,bottom:5}}/>
                      </Container>

                     <Text style={styles.optionText}>Options</Text>
                     <View style={styles.showAgeContainer}>
                        <Text style={styles.switchText}>{this.props.user.showAge===true?'show age':'don\'t show age'}</Text>
                        <Switch onTintColor='#ff6a80' style={styles.switchButton} value = {this.props.user.showAge} onValueChange={(value) => this.props.dispatch(changeShowOption(value))}/>
                     </View>
                     <View style={styles.showNotiContainer}>
                        <Text style={styles.switchText}>{this.props.user.notifications===true?'show notifications':'don\'t show notifications'}</Text>
                        <Switch onTintColor='#ff6a80' style={styles.switchButton} value = {this.props.user.notifications} onValueChange={(value) => this.props.dispatch(showNotification(value))}/>
                     </View>
                </View>
            </ScrollView>
        );
    }
}

/*Connect state from the store to props, state.user corresponds to action.user in reducer.js*/
function mapStateToProps(state) {
    console.log("loading profile update page");
    return {
        user: state.user,
        stateUS: state.stateUS
    };
}

/*Connects a React component to a Redux store*/
export default connect(mapStateToProps)(ProfileUpdate);
