//@refresh reset

import React, {useState, useEffect, useCallback} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  YellowBox,
  TextInput,
  Button,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import * as firebase from 'firebase';
import 'firebase/firestore';
import {GiftedChat} from 'react-native-gifted-chat';

const firebaseConfig = {
  apiKey: 'AIzaSyCP4jGm8HJHjZRW4XeYYJaoCMrKvCy4x2U',
  authDomain: 'howzu-aca52.firebaseapp.com',
  databaseURL: 'https://howzu-aca52.firebaseio.com',
  projectId: 'howzu-aca52',
  storageBucket: 'howzu-aca52.appspot.com',
  messagingSenderId: '7882687527',
  appId: '1:7882687527:web:9c0644b8601ede576bfa02',
};
if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const chatsRef = db.collection('chats');

const App = () => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    readUser();
    const unsubscribe = chatsRef.onSnapshot((querySnapshot) => {
      const messageFirestore = querySnapshot
        .docChanges()
        .filter(({type}) => type === 'added')
        .map(({doc}) => {
          const message = doc.data();
          return {...message, createdAt: message.createdAt.toDate()};
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      appendMessages(messageFirestore);
    });
    return () => unsubscribe();
  }, []);

  const appendMessages = useCallback(
    (messages) => {
      setMessages((prevMessages) => GiftedChat.append(prevMessages, messages));
    },
    [messages],
  );

  async function readUser() {
    const user = await AsyncStorage.getItem('user');
    if (user) {
      setUser(JSON.parse(user));
    }
  }

  async function handleSend(messages) {
    const writes = messages.map((m) => chatsRef.add(m));
    await Promise.all(writes);
  }

  async function handlePress() {
    const _id = Math.random().toString(36).substring(7);
    const user = {_id, name};
    await AsyncStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  }
  if (!user) {
    return (
      <View style={{marginTop: 50}}>
        <TextInput
          style={styles.input}
          placeholder="user"
          value={name}
          onChangeText={(text) => setName(text)}
        />
        <Button title="enter chat" onPress={handlePress} />
      </View>
    );
  }
  return (
    <>
      <GiftedChat messages={messages} user={user} onSend={handleSend} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    color: 'black',
    borderColor: 'royalblue',
    marginBottom: 15,
    padding: 10,
  },
});

export default App;
