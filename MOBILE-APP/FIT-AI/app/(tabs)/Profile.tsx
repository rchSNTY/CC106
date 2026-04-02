import React, { JSX } from 'react'
import { SafeAreaView, View, Text, StyleSheet, StatusBar, TouchableOpacity, Platform } from 'react-native'
import { Image } from 'expo-image'
import { useNavigation } from '@react-navigation/native'
import { useRouter, Href } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export default function Profile(): JSX.Element {
const navigation = useNavigation<any>()
const router = useRouter()

function handleLogout() {
	router.push('/' as Href)
}

return (
<SafeAreaView style={styles.safe}>
<StatusBar barStyle='light-content' backgroundColor='#2C2C2E' />

<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
<Ionicons name='chevron-back' size={24} color='#fff' />
<Text style={styles.backButtonText}>Back</Text>
</TouchableOpacity>

<View style={styles.container}>

{/* Header */}
<View style={styles.header}>
<Image source={require('@/assets/images/user-logo.png')} style={styles.avatar} contentFit='cover' />
<View style={styles.headerTextCol}>
<Text style={styles.headerTitle}>NAME</Text>
<Text style={styles.headerSubtitle}>GENDER</Text>
</View>
</View>

{/* Fields */}
<View style={styles.formSection}>
<View style={styles.fieldRow}>
<Text style={styles.fieldLabel}>Gender</Text>
</View>

<View style={styles.fieldRow}>
<Text style={styles.fieldLabel}>Height</Text>
</View>

<View style={styles.fieldRow}>
<Text style={styles.fieldLabel}>Weight</Text>
</View>

<View style={styles.fieldRow}>
<Text style={styles.fieldLabel}>Activity Level</Text>
</View>

<TouchableOpacity onPress={handleLogout} style={styles.logoutButton} activeOpacity={0.85}>
	<Text style={styles.logoutText}>Logout</Text>
</TouchableOpacity>
</View>
</View>
</SafeAreaView>
)
}

const styles = StyleSheet.create({
safe: { flex: 1, backgroundColor: '#2C2C2E' },
backButton: { 
marginTop: 40, // margin top of atleast 30px
marginLeft: 20, 
flexDirection: 'row', 
alignItems: 'center', 
zIndex: 10 
},
backButtonText: { color: '#fff', fontSize: 16, marginLeft: 4, fontWeight: '600' },
container: { 
flex: 1, 
padding: 24, 
justifyContent: 'center', // Center content vertically
},
header: { flexDirection: 'row', alignItems: 'center', marginBottom: 40 },
avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#ddd', marginRight: 24 },
headerTextCol: { justifyContent: 'center' },
headerTitle: { fontSize: 24, fontWeight: '800', color: '#FFFFFF', marginBottom: 4, letterSpacing: 1 },
headerSubtitle: { fontSize: 18, fontWeight: '600', color: '#DDDDDD', letterSpacing: 1 },
formSection: { gap: 16 },
fieldRow: {
backgroundColor: '#D9D9D9',
borderRadius: 16,
height: 56,
justifyContent: 'center',
paddingHorizontal: 20,
shadowColor: '#000',
shadowOpacity: 0.15,
shadowRadius: 6,
shadowOffset: { width: 0, height: 4 },
elevation: 4,
},
fieldLabel: {
fontSize: 15,
color: '#333',
fontWeight: '600',
fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }),
},
logoutButton: {
	backgroundColor: '#ff3b30',
	borderRadius: 12,
	height: 56,
	justifyContent: 'center',
	alignItems: 'center',
	marginTop: 12,
	shadowColor: '#000',
	shadowOpacity: 0.15,
	shadowRadius: 6,
	shadowOffset: { width: 0, height: 4 },
	elevation: 4,
},
logoutText: {
	color: '#fff',
	fontSize: 16,
	fontWeight: '700',
},
})
