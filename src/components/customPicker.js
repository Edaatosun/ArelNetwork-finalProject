






/* burası öğrenme ve deneme için */











// // components/DateTimeScrollPicker.js
// import React, { useState, useEffect, useRef } from "react";
// import { View, Text, FlatList, Dimensions } from "react-native";

// const { height } = Dimensions.get("window");

// const ITEM_HEIGHT = 50;
// const VISIBLE_ITEMS = 5;

// const days = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
// const months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

// export default function CustomPicker({ onSelect }) {
//   const [dates, setDates] = useState([]);
//   const [times, setTimes] = useState([]);
//   const [selectedDateIndex, setSelectedDateIndex] = useState(0);
//   const [selectedTimeIndex, setSelectedTimeIndex] = useState(0);

//   const dateListRef = useRef(null);
//   const timeListRef = useRef(null);

//   useEffect(() => {
//     const now = new Date();
//     const generatedDates = [];
//     for (let i = 0; i < 30; i++) {
//       const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
//       const dayName = days[date.getDay()];
//       const monthName = months[date.getMonth()];
//       const dayNumber = date.getDate();
//       generatedDates.push(`${dayName} ${dayNumber} ${monthName}`);
//     }
//     setDates(generatedDates);

//     const generatedTimes = [];
//     for (let hour = 0; hour < 24; hour++) {
//       for (let min = 0; min < 60; min += 15) {
//         const hourStr = hour.toString().padStart(2, "0");
//         const minStr = min.toString().padStart(2, "0");
//         generatedTimes.push(`${hourStr}:${minStr}`);
//       }
//     }
//     setTimes(generatedTimes);
//   }, []);

//   const handleDateScroll = (event) => {
//     const offsetY = event.nativeEvent.contentOffset.y;
//     const index = Math.round(offsetY / ITEM_HEIGHT);
//     setSelectedDateIndex(index);
//     triggerOnSelect(index, selectedTimeIndex);
//   };

//   const handleTimeScroll = (event) => {
//     const offsetY = event.nativeEvent.contentOffset.y;
//     const index = Math.round(offsetY / ITEM_HEIGHT);
//     setSelectedTimeIndex(index);
//     triggerOnSelect(selectedDateIndex, index);
//   };

//   const triggerOnSelect = (dateIndex, timeIndex) => {
//     if (dates[dateIndex] && times[timeIndex]) {
//       onSelect({
//         date: dates[dateIndex],
//         time: times[timeIndex],
//       });
//     }
//   };

//   return (
//     <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20 }}>
//       {/* Tarih Seçimi */}
//       <View style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS, flex: 1 }}>
//         <FlatList
//           ref={dateListRef}
//           data={dates}
//           keyExtractor={(item, index) => `date-${index}`}
//           showsVerticalScrollIndicator={false}
//           snapToInterval={ITEM_HEIGHT}
//           decelerationRate="fast"
//           bounces={false}
//           onScroll={handleDateScroll}
//           scrollEventThrottle={16}
//           contentContainerStyle={{
//             paddingTop: (ITEM_HEIGHT * (VISIBLE_ITEMS / 2)),
//             paddingBottom: (ITEM_HEIGHT * (VISIBLE_ITEMS / 2)),
//           }}
//           renderItem={({ item, index }) => {
//             const isSelected = index === selectedDateIndex;
//             return (
//               <View style={{ height: ITEM_HEIGHT, justifyContent: "center", alignItems: "center" }}>
//                 <Text style={{
//                   fontSize: isSelected ? 24 : 18,
//                   color: isSelected ? "#000" : "#aaa",
//                   fontWeight: isSelected ? "bold" : "normal",
//                 }}>
//                   {item}
//                 </Text>
//               </View>
//             );
//           }}
//         />
//       </View>

//       {/* Saat Seçimi */}
//       <View style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS, flex: 1 }}>
//         <FlatList
//           ref={timeListRef}
//           data={times}
//           keyExtractor={(item, index) => `time-${index}`}
//           showsVerticalScrollIndicator={false}
//           snapToInterval={ITEM_HEIGHT}
//           decelerationRate="fast"
//           bounces={false}
//           onScroll={handleTimeScroll}
//           scrollEventThrottle={16}
//           contentContainerStyle={{
//             paddingTop: (ITEM_HEIGHT * (VISIBLE_ITEMS / 2)),
//             paddingBottom: (ITEM_HEIGHT * (VISIBLE_ITEMS / 2)),
//           }}
//           renderItem={({ item, index }) => {
//             const isSelected = index === selectedTimeIndex;
//             return (
//               <View style={{ height: ITEM_HEIGHT, justifyContent: "center", alignItems: "center" }}>
//                 <Text style={{
//                   fontSize: isSelected ? 24 : 18,
//                   color: isSelected ? "#000" : "#aaa",
//                   fontWeight: isSelected ? "bold" : "normal",
//                 }}>
//                   {item}
//                 </Text>
//               </View>
//             );
//           }}
//         />
//       </View>
//     </View>
//   );
// }
