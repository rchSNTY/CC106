import React, { JSX } from 'react'
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  TextInput,
} from 'react-native'
import { Image } from 'expo-image'
import { useRouter, Href } from 'expo-router'

export default function Explore(): JSX.Element {
	const router = useRouter()

	const handleProfilePress = () => {
		router.push('/Profile' as Href)
	}

	return (
		<SafeAreaView style={styles.safe}>
			<StatusBar barStyle="dark-content" />

			<View style={styles.container}>
				<Text style={styles.browseTitle}>Browse Here!!</Text>
				<View style={styles.searchWrap}>
					<Image source={require('@/assets/images/search.png')} style={styles.searchIcon} contentFit="contain" />
					<TextInput
						placeholder="Search Here"
						placeholderTextColor="#999"
						style={styles.searchInput}
						editable={true}
						onFocus={() => {}}
					/>
				</View>
			</View>

			<View style={styles.bottomNavWrap} pointerEvents="box-none">
				<View style={styles.bottomNav}>
					<TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={() => router.push('/Homepage' as Href)}>
						<Image source={require('@/assets/images/home.png')} style={styles.navIconHome} contentFit="contain" />
						<Text style={styles.navLabel}>Home</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={() => router.push('/Favorites' as Href)}>
						<Image source={require('@/assets/images/favorite-logo.png')} style={styles.navIcon} contentFit="contain" />
						<Text style={styles.navLabel}>Favorites</Text>
					</TouchableOpacity>
					
					<TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={() => router.push('/explore' as Href)}>
						<Image source={require('@/assets/images/search.png')} style={styles.navIcon} contentFit="contain" />
						<Text style={styles.navLabel}>Explore</Text>
					</TouchableOpacity>

					<TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={() => router.push('/Log' as Href)}>
						<Image source={require('@/assets/images/activity-log.png')} style={styles.navIcon} contentFit="contain" />
						<Text style={styles.navLabel}>Activity Log</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={handleProfilePress}>
						<Image source={require('@/assets/images/user-logo.png')} style={styles.navIcon} contentFit="contain" />
						<Text style={styles.navLabel}>Profile</Text>
					</TouchableOpacity>
				</View>
			</View>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	safe: { flex: 1, backgroundColor: '#ffffff' },
	container: { flex: 1, backgroundColor: '#ffffff', padding: 20, paddingBottom: 100, justifyContent: 'flex-start', alignItems: 'stretch' },
	browseTitle: {
		marginTop: 40,
		fontSize: 24,
		fontWeight: 'bold',
		color: '#111',
		marginBottom: 10,
	},
	searchWrap: {
		width: '100%',
		marginBottom: 12,
		marginTop: 20,
		height: 42,
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#f2f2f2',
		borderRadius: 20,
		paddingHorizontal: 14,
	},
	searchIcon: { width: 18, height: 18, marginRight: 8 },
	searchInput: {
		flex: 1,
		height: 42,
		fontSize: 14,
		color: '#222',
		fontWeight: '600',
	},
	bottomNavWrap: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		alignItems: 'center',
	},
	bottomNav: {
		flexDirection: 'row',
		backgroundColor: '#ffffff',
		height: 72,
		paddingHorizontal: 18,
		alignItems: 'center',
		justifyContent: 'space-between',
		width: '100%',
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: '#e6e6e6',
	},
	navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
	navIcon: { width: 24, height: 24, marginBottom: 4 },
	navIconHome: { width: 28, height: 28, marginBottom: 4 },
	navLabel: { fontSize: 11, color: '#333', fontWeight: '600', textAlign: 'center' },
})
