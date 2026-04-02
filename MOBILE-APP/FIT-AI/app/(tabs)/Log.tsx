import React, { JSX } from 'react'
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import { Image } from 'expo-image'
import { useRouter, Href } from 'expo-router'

// Declared Data
const WORKOUT_HISTORY = [
  {
    id: 1,
    date: 'March 5, 2026',
    title: 'Intense Bodyweight',
    duration: '45 mins',
  },
  {
    id: 2,
    date: 'March 3, 2026',
    title: 'Moderate Cardio',
    duration: '30 mins',
  },
]

export default function Log(): JSX.Element {
  const router = useRouter()

  const handleProfilePress = () => {
    router.push('/Profile' as Href)
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Top Header with Logo */}
        <View style={styles.topHeader}>
           <Image source={require('@/assets/images/Logo.png')} style={styles.topLogo} contentFit="contain" />
           <Text style={styles.topLogoText}>FITBUD</Text>
        </View>

        {/* Back Button */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>{'< Back'}</Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Activity Log</Text>

        {/* This Week's Streak */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Weeks Streak</Text>
          <View style={styles.streakRow}>
            {/* M - White bg (blended), green text to match T bg style logic perhaps, or just color */}
            <View style={[styles.dayCircle, styles.dayCircleWhite]}>
              <Text style={styles.dayTextGreen}>M</Text>
            </View>
            {/* T - Highlighted Green */}
            <View style={[styles.dayCircle, styles.dayCircleGreen]}>
              <Text style={styles.dayTextWhite}>T</Text>
            </View>
            {/* Others - Grayed out */}
            <View style={[styles.dayCircle, styles.dayCircleGray]}>
              <Text style={styles.dayTextGray}>W</Text>
            </View>
            <View style={[styles.dayCircle, styles.dayCircleGray]}>
              <Text style={styles.dayTextGray}>T</Text>
            </View>
            <View style={[styles.dayCircle, styles.dayCircleGray]}>
              <Text style={styles.dayTextGray}>F</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Workouts</Text>
              <Text style={styles.statValue}>2</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Active Time</Text>
              <Text style={styles.statValue}>135 mins</Text>
            </View>
          </View>
        </View>

        {/* Workout History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workout History</Text>
          <View style={styles.historyList}>
            {WORKOUT_HISTORY.map((item) => (
              <View key={item.id} style={styles.historyCard}>
                <View style={styles.historyContent}>
                  <Text style={styles.historyDate}>{item.date}</Text>
                  <Text style={styles.historyTitle}>{item.title}</Text>
                  <Text style={styles.historyDuration}>{item.duration}</Text>
                </View>
                 {/* Right arrow placeholder */}
                 <View style={styles.arrowIcon}>
                    <Text style={{color:'#ccc', fontSize: 18}}>{'v'}</Text>
                 </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
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
  safe: { flex: 1, backgroundColor: '#f2f2f7' }, 
  scrollContainer: { padding: 20, paddingBottom: 100 },
  
  topHeader: { alignItems: 'center', marginBottom: 20, marginTop: 30 },
  topLogo: { width: 50, height: 50, marginBottom: 4 }, 
  topLogoText: { fontSize: 20, fontWeight: '800', fontStyle: 'italic', letterSpacing: -0.5, color: '#000' },

  backButton: { marginBottom: 10, alignSelf: 'flex-start' },
  backText: { fontSize: 16, color: '#4CD964', fontWeight: '600' },

  pageTitle: { fontSize: 28, fontWeight: '800', color: '#000', marginBottom: 24 },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#000', marginBottom: 12 },

  // Streak
  streakRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 },
  dayCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  dayCircleWhite: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e5ea' }, 
  dayCircleGreen: { backgroundColor: '#00c800', shadowColor: '#00c800', shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 }, 
  dayCircleGray: { backgroundColor: '#e5e5ea' }, 
  
  dayTextGreen: { fontSize: 16, fontWeight: '700', color: '#00c800' }, 
  dayTextWhite: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  dayTextGray: { fontSize: 16, fontWeight: '700', color: '#c7c7cc' },

  // Stats
  statsRow: { flexDirection: 'row', gap: 16 },
  statCard: { 
    flex: 1, 
    backgroundColor: '#cceeee', 
    borderRadius: 16, 
    paddingVertical: 24, 
    paddingHorizontal: 16,
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  statLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: '800', color: '#000' },

  // History
  historyList: { gap: 12 },
  historyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  historyContent: { gap: 4 },
  historyDate: { fontSize: 13, fontWeight: '700', color: '#00c800' },
  historyTitle: { fontSize: 16, fontWeight: '800', color: '#000' },
  historyDuration: { fontSize: 14, fontWeight: '600', color: '#008080' },
  arrowIcon: { paddingRight: 8 },

  // Bottom Nav
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
