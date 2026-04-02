import React, { JSX } from 'react'
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native'
import { Image } from 'expo-image'
import { useRouter, Href } from 'expo-router'

export default function Homepage(): JSX.Element {
	const router = useRouter()

	const handleProfilePress = () => {
		router.push('/Profile' as Href)
	}

	return (
		<SafeAreaView style={styles.safe}>
			<StatusBar barStyle="dark-content" />

				<View style={styles.container}>
					<View style={styles.headerRow}>
						<Image source={require('@/assets/images/Logo.png')} style={styles.logo} contentFit="contain" />
						<Text style={styles.welcomeText}>Welcome User!!</Text>
					</View>

					<View style={styles.previewWrap}>
						<View style={styles.previewCard}>
							<Text style={styles.previewTitle}>Preview</Text>
							<Text style={styles.previewSubtitle}>Placeholder — no images, static preview</Text>
						</View>
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
	previewCard: {
		width: '100%',
		maxWidth: 520,
		height: 220,
		borderRadius: 12,
		backgroundColor: '#f8f8f8',
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: '#000',
		shadowOpacity: 0.04,
		shadowRadius: 6,
		shadowOffset: { width: 0, height: 2 },
		elevation: 1,
	},
	previewTitle: { fontSize: 18, color: '#111', marginBottom: 6, fontWeight: '700' },
	previewSubtitle: { fontSize: 13, color: '#555' },
	headerRow: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 40, marginBottom: 10 },
	logo: { width: 44, height: 44, borderRadius: 8 },
	welcomeText: { fontSize: 16, color: '#111', fontWeight: '700' },
	previewWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },

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
	navItemCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
	navIconPlaceholder: {
		width: 24,
		height: 24,
		marginBottom: 4,
	},
	navIcon: { width: 24, height: 24, marginBottom: 4 },
	navIconHome: { width: 28, height: 28, marginBottom: 4 },
	navCenterCircle: {
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: '#ffffff',
		borderWidth: 2,
		borderColor: '#e6e6e6',
	},
	navLabel: { fontSize: 11, color: '#333', fontWeight: '600', textAlign: 'center' },
})

