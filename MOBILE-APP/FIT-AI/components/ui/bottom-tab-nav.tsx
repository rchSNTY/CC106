import { Image } from 'expo-image'
import { Href, useRouter } from 'expo-router'
import React, { JSX } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { UiTheme } from '@/constants/ui-theme'

type TabKey = 'Homepage' | 'Favorites' | 'explore' | 'Log' | 'Profile'

type BottomTabNavProps = {
  activeTab: TabKey
}

const TABS: { key: TabKey; label: string; route: Href; icon: any; iconStyle?: 'home' | 'default' }[] = [
  {
    key: 'Homepage',
    label: 'Home',
    route: '/Homepage',
    icon: require('@/assets/images/home.png'),
    iconStyle: 'home',
  },
  {
    key: 'Favorites',
    label: 'Favorites',
    route: '/Favorites',
    icon: require('@/assets/images/favorite-logo.png'),
  },
  {
    key: 'explore',
    label: 'Explore',
    route: '/explore',
    icon: require('@/assets/images/search.png'),
  },
  {
    key: 'Log',
    label: 'Activity Log',
    route: '/Log',
    icon: require('@/assets/images/activity-log.png'),
  },
  {
    key: 'Profile',
    label: 'Profile',
    route: '/Profile',
    icon: require('@/assets/images/user-logo.png'),
  },
]

export default function BottomTabNav({ activeTab }: BottomTabNavProps): JSX.Element {
  const router = useRouter()

  return (
    <View style={styles.bottomNavWrap} pointerEvents="box-none">
      <View style={styles.bottomNav}>
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab

          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.navItem}
              activeOpacity={0.8}
              onPress={() => router.push(tab.route)}
            >
              <Image
                source={tab.icon}
                style={tab.iconStyle === 'home' ? styles.navIconHome : styles.navIcon}
                contentFit="contain"
              />
              <ThemedText style={[styles.navLabel, isActive && styles.navLabelActive]}>{tab.label}</ThemedText>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  bottomNavWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: UiTheme.colors.surface,
    height: UiTheme.nav.height,
    paddingHorizontal: UiTheme.spacing.md,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: UiTheme.colors.border,
  },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: UiTheme.spacing.xs },
  navIcon: { width: 24, height: 24, marginBottom: 4 },
  navIconHome: { width: 28, height: 28, marginBottom: 4 },
  navLabel: { fontSize: 11, color: UiTheme.colors.textSecondary, fontWeight: '600', textAlign: 'center' },
  navLabelActive: { color: UiTheme.colors.accent, fontWeight: '700' },
})