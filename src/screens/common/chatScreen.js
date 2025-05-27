import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");

  const sendMessage = () => {
    if (inputText.trim() === "") return;

    const newMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: "me",
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");
  };

  const renderItem = ({ item }) => {
    const isMe = item.sender === "me";
    return (
      <View
        className={`rounded-xl px-4 py-2 my-1 max-w-[75%] ${isMe ? "bg-green-400 self-end" : "bg-gray-300 self-start"}`}
      >
        <Text>{item.text}</Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 mt-10 shadow bg-white">
        <Icon name="arrow-back" size={28} color="black" />
        <Text className="ml-4 text-xl font-semibold text-gray-800">Sohbet</Text>
      </View>

      {/* Mesaj Listesi */}
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end", paddingHorizontal: 12, paddingVertical: 10 }}
      />

      {/* Mesaj Giriş */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
        className="flex-row items-center px-4 py-5 bg-white mb-10"
      >
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Mesaj yaz..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-5 text-base mr-2"
        />
        <TouchableOpacity onPress={sendMessage}>
          <Icon name="send" size={28} color="#2563EB" />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}
