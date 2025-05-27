import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, Platform, Image, Keyboard, Alert } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import io from "socket.io-client";

export default function ChatScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { userInfo } = route.params; // Karşı tarafın bilgileri (receiver)

    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    const socketRef = useRef(null);

    useEffect(() => {
        // AsyncStorage'dan token alıp socket bağlantısı yap
        const setupSocket = async () => {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                Alert.alert("Hata", "Giriş yapmanız gerekiyor.");
                navigation.goBack();
                return;
            }

            // Backend URL ve portu buraya yaz, token query ile gönder
            const socket = io("https://bitirme-projesi-17w9.onrender.com:3001", {
                query: { token },
                transports: ["websocket"],
            });

            socketRef.current = socket;

            socket.on("connect", () => {
                console.log("Socket bağlandı:", socket.id);

                // Odaya katıl
                socket.emit("joinRoom", {
                    receiver_id: userInfo.id,
                });
            });

            socket.on("receiveMessage", (message) => {
                // Gelen mesajları ekle
                setMessages((prev) => [...prev, message]);
            });

            socket.on("disconnect", () => {
                console.log("Socket bağlantısı kesildi");
            });

            socket.on("error", (err) => {
                console.error("Socket error:", err);
            });
        };

        setupSocket();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    const sendMessage = () => {
        if (inputText.trim() === "") return;

        if (!socketRef.current || !socketRef.current.connected) {
            Alert.alert("Hata", "Sunucuya bağlantı yok.");
            return;
        }

        const messageData = {
            receiver_id: userInfo.id,
            message: inputText.trim(),
        };

        // Mesajı hemen UI'a ekle (geçici olarak "me" gönderici ile)
        const optimisticMessage = {
            _id: Date.now().toString(), // geçici id
            sender_id: "me",
            receiver_id: userInfo.id,
            message: inputText.trim(),
            createdAt: new Date(),
        };
        setMessages((prev) => [...prev, optimisticMessage]);

        socketRef.current.emit("sendMessage", messageData);

        setInputText("");
    };

    const renderItem = ({ item }) => {
        const isMe = item.sender_id === "me" || item.sender_id === JSON.parse(atob((socketRef.current?.io?.opts.query.token || "").split('.')[1] || "")).id;
        return (
            <View
                style={{
                    alignSelf: isMe ? "flex-end" : "flex-start",
                    backgroundColor: isMe ? "#34D399" : "#E5E7EB",
                    padding: 10,
                    borderRadius: 10,
                    marginVertical: 5,
                    maxWidth: "75%",
                }}
            >
                <Text>{item.message || item.text}</Text>
            </View>
        );
    };

    // Klavye yüksekliği dinleme
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
            (e) => setKeyboardHeight(e.endCoordinates.height)
        );
        const keyboardDidHideListener = Keyboard.addListener(
            Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
            () => setKeyboardHeight(0)
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    return (
        <View style={{ flex: 1, backgroundColor: "white" }}>
            {/* Header */}
            <View style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 16,
                backgroundColor: "white",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 3,
                marginTop: 5,
            }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
                    <Icon name="arrow-back" size={28} color="black" />
                </TouchableOpacity>
                <Image
                    source={{ uri: userInfo.photo }}
                    style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12 }}
                />
                <Text style={{ fontSize: 20, fontWeight: "600", color: "#1f2937" }}>
                    {userInfo.firstName} {userInfo.lastName}
                </Text>
            </View>

            {/* Mesaj Listesi */}
            <FlatList
                data={messages}
                renderItem={renderItem}
                keyExtractor={(item) => item._id.toString()}
                contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end", paddingHorizontal: 10, paddingTop: 10 }}
            />

            {/* Mesaj Giriş */}
            <View style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingVertical: 10,
                backgroundColor: "white",
                marginBottom: Platform.OS === "ios" ? keyboardHeight : keyboardHeight,
            }}>
                <TextInput
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Mesaj yaz..."
                    style={{
                        flex: 1,
                        backgroundColor: "#f3f4f6",
                        borderRadius: 9999,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        marginRight: 8,
                        fontSize: 16,
                    }}
                />
                <TouchableOpacity onPress={sendMessage}>
                    <Icon name="send" size={30} color="#2563EB" />
                </TouchableOpacity>
            </View>
        </View>
    );
}
