import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView } from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Home = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.welcomeText}>Welcome to Project101</Text>
        <Text style={styles.subtitle}>
          Easily connect with nearby shopkeepers for quick purchases!
        </Text>
        <TouchableOpacity
          style={styles.requestButton}
          onPress={() => navigation.navigate("Request")}
        >
          <Text style={styles.buttonText}>Post a Request</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.requestButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>

      {/* Featured Shopkeepers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nearby Shopkeepers</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {/* Sample shopkeeper card */}
          <View style={styles.shopCard}>
            <Image source={{ uri: "https://via.placeholder.com/80" }} style={styles.shopImage} />
            <Text style={styles.shopName}>Raj Electronics</Text>
            <Text style={styles.shopCategory}>Mobile Accessories</Text>
          </View>

          <View style={styles.shopCard}>
            <Image source={{ uri: "https://via.placeholder.com/80" }} style={styles.shopImage} />
            <Text style={styles.shopName}>Gupta Store</Text>
            <Text style={styles.shopCategory}>Daily Essentials</Text>
          </View>
        </ScrollView>
      </View>

      {/* Footer Section */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Made with ❤️ for local businesses</Text>
        <Ionicons name="storefront-outline" size={24} color="white" />
      </View>
    </ScrollView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  hero: {
    backgroundColor: "#00796B",
    padding: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: "center",
  },
  welcomeText: { fontSize: 24, fontWeight: "bold", color: "#fff", marginBottom: 5 },
  subtitle: { fontSize: 16, color: "#E0F2F1", textAlign: "center", marginBottom: 10 },
  requestButton: {
    backgroundColor: "#FFB300",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  shopCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginRight: 15,
    elevation: 3,
  },
  shopImage: { width: 80, height: 80, borderRadius: 10, marginBottom: 5 },
  shopName: { fontSize: 16, fontWeight: "bold" },
  shopCategory: { fontSize: 14, color: "#555" },
  footer: {
    backgroundColor: "#00796B",
    padding: 15,
    alignItems: "center",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  footerText: { color: "white", fontSize: 14 },
});
