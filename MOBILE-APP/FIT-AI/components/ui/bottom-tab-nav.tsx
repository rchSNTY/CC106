import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { Href, useRouter } from 'expo-router'
import React, { JSX } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ThemedText } from '@/components/themed-text'
import { UiTheme } from '@/constants/ui-theme'

type TabKey = 'Homepage' | 'Favorites' | 'explore' | 'Log' | 'Profile'

type BottomTabNavProps = {
  activeTab: TabKey
}

const TABS: { key: TabKey; label: string; route: Href; icon: React.ComponentProps<typeof MaterialIcons>['name'] }[] = [
  {
    key: 'Homepage',
    label: 'Home',
    route: '/Homepage',
    icon: 'home-filled',
  },
  {
    key: 'Favorites',
    label: 'Favorites',
    route: '/Favorites',
    icon: 'favorite',
  },
  {
    key: 'explore',
    label: 'Explore',
    route: '/explore',
    icon: 'search',
  },
  {
    key: 'Log',
    label: 'Activity',
    route: '/Log',
    icon: 'insights',
  },
  {
    key: 'Profile',
    label: 'Profile',
    route: '/Profile',
    icon: 'person',
  },
]

export default function BottomTabNav({ activeTab }: BottomTabNavProps): JSX.Element {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  return (
    <View style={styles.bottomNavWrap} pointerEvents="box-none">
      <View style={[styles.bottomNav, { marginBottom: Math.max(10, insets.bottom) }]}>
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab
          const tint = isActive ? UiTheme.colors.accent : UiTheme.colors.textSecondary

          return (
            <Pressable
              key={tab.key}
              style={styles.navItem}
              onPress={() => router.push(tab.route)}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
              hitSlop={10}
            >
              <View style={[styles.iconWrap, isActive ? styles.iconWrapActive : null]}>
                <MaterialIcons name={tab.icon} size={24} color={tint} />
              </View>
              <ThemedText style={[styles.navLabel, isActive && styles.navLabelActive]}>{tab.label}</ThemedText>
            </Pressable>
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
    paddingHorizontal: UiTheme.spacing.lg,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: UiTheme.colors.surfaceElevated,
    minHeight: 68,
    paddingHorizontal: UiTheme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    borderWidth: 1,
    borderColor: UiTheme.colors.border,
    borderRadius: 26,
    ...UiTheme.shadow.floating,
  },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: UiTheme.spacing.xs },
  iconWrap: {
    width: 40,
    height: 34,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: UiTheme.colors.accentSoft,
  },
  navLabel: { fontSize: 11, color: UiTheme.colors.textSecondary, fontWeight: '700', textAlign: 'center' },
  navLabelActive: { color: UiTheme.colors.accent, fontWeight: '800' },
})
