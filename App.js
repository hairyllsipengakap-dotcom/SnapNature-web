import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';

// This function represents your Home Feed screen
export default function App() {
  const [filter, setFilter] = useState('All');

  // Dummy data representing what you would fetch from Firebase
  const dummyData = [
    { id: '1', title: 'Rafflesia', category: 'Flora' },
    { id: '2', title: 'Long-tailed macaque', category: 'Fauna' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Hero Section (Replaces your <header class="hero">) */}
      <View style={styles.hero}>
        <Text style={styles.brand}>🌿 SnapNature</Text>
        <Text style={styles.heroTitle}>Field notes from the wild, catalogued.</Text>
      </View>

      {/* Filter Bar (Replaces your <div class="filter-bar">) */}
      <View style={styles.filterBar}>
        {['All', 'Flora', 'Fauna'].map((tab) => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.filterBtn, filter === tab && styles.filterBtnActive]}
            onPress={() => setFilter(tab)}
          >
            <Text style={[styles.filterText, filter === tab && styles.filterTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Feed Container (Replaces your <div id="feedContainer">) */}
      <FlatList
        data={dummyData.filter(item => filter === 'All' || item.category === filter)}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardCategory}>{item.category}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.loading}>No posts found...</Text>}
      />

    </SafeAreaView>
  );
}

// Styles (Replaces your style.css)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  hero: { padding: 20, backgroundColor: '#2E7D32' },
  brand: { fontSize: 18, fontWeight: 'bold', color: 'white', marginBottom: 10 },
  heroTitle: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  filterBar: { flexDirection: 'row', padding: 15, justifyContent: 'space-around', backgroundColor: 'white' },
  filterBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#E0E0E0' },
  filterBtnActive: { backgroundColor: '#2E7D32' },
  filterText: { color: '#333', fontWeight: '600' },
  filterTextActive: { color: 'white' },
  card: { backgroundColor: 'white', padding: 15, margin: 15, borderRadius: 8, shadowColor: '#000', shadowOpacity: 0.1, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  cardCategory: { color: 'gray', marginTop: 4 },
  loading: { textAlign: 'center', marginTop: 20, color: 'gray' }
});