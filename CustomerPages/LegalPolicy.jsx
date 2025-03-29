import React from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  Pressable,
  StatusBar
} from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'

const LegalPolicy = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        backgroundColor="#FFFFFF" 
        barStyle="dark-content"
      />
      {/* Header with Back Button */}
      <View style={styles.header}>
        <Pressable 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color="#333" 
          />
        </Pressable>
        <Text style={styles.headerTitle}>Legal Policy</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {[
          {
            title: "1. Terms of Service",
            content: "By using our service, you agree to comply with and be bound by the following terms and conditions. We reserve the right to modify these terms at any time without prior notice.",
            highlights: []
          },
          {
            title: "2. Privacy Policy",
            content: "We are committed to protecting your personal information. We collect, use, and safeguard your data in accordance with our privacy guidelines and applicable data protection laws.",
            highlights: [
              "Personal information is collected only with your consent",
              "Data is encrypted and securely stored",
              "We do not sell or share your personal information with third parties"
            ]
          },
          {
            title: "3. User Responsibilities",
            content: "Users are responsible for maintaining the confidentiality of their account and for all activities that occur under their account.",
            highlights: [
              "Protect your login credentials",
              "Report any unauthorized access immediately",
              "Use the service responsibly and ethically"
            ]
          },
          {
            title: "4. Intellectual Property",
            content: "All content, trademarks, designs, and logos are the property of our company and are protected by intellectual property laws.",
            highlights: []
          },
          {
            title: "5. Limitation of Liability",
            content: "We are not liable for any direct, indirect, incidental, or consequential damages arising from the use of our service.",
            highlights: []
          },
          {
            title: "6. Dispute Resolution",
            content: "Any disputes shall be resolved through arbitration in accordance with the rules of the American Arbitration Association.",
            highlights: []
          },
          {
            title: "7. Governing Law",
            content: "These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which our company is registered.",
            highlights: []
          }
        ].map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionText}>{section.content}</Text>
            {section.highlights.length > 0 && (
              <View style={styles.highlightContainer}>
                {section.highlights.map((highlight, highlightIndex) => (
                  <View key={highlightIndex} style={styles.highlightRow}>
                    <View style={styles.bulletPoint} />
                    <Text style={styles.highlightText}>{highlight}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        <View style={styles.lastSection}>
          <Text style={styles.footnote}>
            Last Updated: March 2024
          </Text>
          <Text style={styles.footnote}>
            © 2024 All Rights Reserved
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default LegalPolicy

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom:4
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 18,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    color: '#34495E',
    lineHeight: 24,
    marginBottom: 10,
  },
  highlightContainer: {
    paddingLeft: 10,
    marginTop: 5,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3498DB',
    marginRight: 10,
  },
  highlightText: {
    fontSize: 15,
    color: '#2980B9',
    lineHeight: 22,
  },
  lastSection: {
    marginTop: 20,
    alignItems: 'center',
    paddingBottom: 20,
  },
  footnote: {
    color: '#7F8C8D',
    fontSize: 14,
    marginBottom: 5,
  },
})