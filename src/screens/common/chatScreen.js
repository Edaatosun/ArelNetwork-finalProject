import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { commonApi } from "../../connector/URL";
import io from "socket.io-client";
import { BASE_URL } from '@env';

export default function ChatScreen({ route }) {
  const navigation = useNavigation();
  const { userInfo } = route.params;
  const receiver_id = userInfo._id;

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const socketRef = useRef(null);
  const flatListRef = useRef(null);

  const getMessages = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await commonApi.get(`/messages/${receiver_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data.messages);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 50);
    } catch (err) {
      console.error("Mesajlar alınamadı:", err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const setupSocket = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const socket = io(BASE_URL, {
        query: { token },
        transports: ["websocket"],
      });
      socketRef.current = socket;

      socket.on("connect", async () => {
        try {
          await commonApi.post(
            "/join-room",
            { receiver_id },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (isMounted) await getMessages();
        } catch (err) {
          console.error("Katılım hatası:", err);
          Alert.alert("Hata", "Sohbete katılırken sorun oluştu.");
        }
      });

      socket.on("receiveMessage", () => {
        if (isMounted) getMessages();
      });
    };

    setupSocket();

    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      isMounted = false;
      socketRef.current?.disconnect();
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    try {
      const token = await AsyncStorage.getItem("token");
      await commonApi.post(
        "/send-messages",
        { receiver_id, message: inputText.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInputText("");
      getMessages();
      socketRef.current?.emit("sendMessage", {}); 
    } catch (err) {
      console.error("Mesaj gönderilemedi:", err);
      Alert.alert("Hata", "Mesaj gönderilemedi.");
    }
  };

  const renderItem = ({ item }) => {
    const isMe = item.sender_id !== receiver_id;
    return (
      <View
        className={`rounded-xl px-4 py-2 my-1 max-w-[75%] ${
          isMe ? "bg-green-400 self-end" : "bg-gray-300 self-start"
        }`}
      >
        <Text>{item.message}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <View className="flex-1 bg-white px-4">
        {/* Header */}
        <View className="flex-row items-center py-3 mt-10 shadow bg-white">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={28} color="black" />
          </TouchableOpacity>
          <Image
            source={{ uri: userInfo.photo }}
            style={{ width: 35, height: 35, borderRadius: 20, marginLeft: 10 }}
          />
          <Text className="ml-3 text-xl font-semibold text-gray-800">
            {userInfo.firstName} {userInfo.lastName}
          </Text>
        </View>

        {/* Mesajlar */}
        <FlatList
          ref={flatListRef}
          data={messages}
          extraData={messages}
          renderItem={renderItem}
          keyExtractor={(item, index) =>
            item._id?.toString() || `${item.message}-${index}`
          }
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "flex-end",
            paddingVertical: 10,
          }}
        />

        {/* Giriş alanı */}
        <View
          className="flex-row items-center py-3 bg-white"
          style={{ paddingBottom: Platform.OS === "android" ? keyboardHeight : 0 }}
        >
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Mesaj yaz..."
            className="flex-1 bg-gray-100 mb-16 rounded-full px-4 py-5 text-base mr-2"
            multiline
          />
          <TouchableOpacity className="mb-16" onPress={sendMessage}>
            <Icon name="send" size={28} color="#2563EB" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
