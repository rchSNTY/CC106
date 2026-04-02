import React, { JSX } from 'react'
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Image } from 'expo-image'
import { useRouter, Href } from 'expo-router'

export default function Favorites(): JSX.Element {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Favorites</Text>
          <Text style={styles.subtitle}>The selected favorites will be displayed here</Text>
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
            <TouchableOpacity style={styles.navItemCenter} activeOpacity={0.7} onPress={() => router.push('/explore' as Href)}>
               <Image source={require('@/assets/images/search.png')} style={styles.navIcon} contentFit="contain" />
              <Text style={styles.navLabel}>Explore</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={() => router.push('/Log' as Href)}>
              <Image source={require('@/assets/images/activity-log.png')} style={styles.navIcon} contentFit="contain" />
              <Text style={styles.navLabel}>Activity Log</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} activeOpacity={0.7}  onPress={() => router.push('/Profile' as Href)}  >
              <Image source={require('@/assets/images/user-logo.png')} style={styles.navIcon} contentFit="contain" />
              <Text style={styles.navLabel}>Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  container: { flex: 1, backgroundColor: '#ffffff', padding: 20, paddingBottom: 100 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center' },

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
