import { Image } from 'expo-image';
import { Href, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { UiTheme } from '@/constants/ui-theme';

const HERO_SLIDES = [
  {
    key: 'personalized',
    image: require('@/assets/images/index/personalizedplan.jpg'),
    title: 'Personalized Workout Plans',
    description: 'Get AI-powered fitness plans tailored to your goals and activity level.',
  },
  {
    key: 'discovery',
    image: require('@/assets/images/index/wokroutdiscovery.jpg'),
    title: 'Discover New Routines',
    description: 'Explore curated workouts and save your favorites for later.',
  },
  {
    key: 'progress',
    image: require('@/assets/images/index/progresstracking.jpg'),
    title: 'Track Your Progress',
    description: 'See your activity history and celebrate milestones.',
  },
] as const;

export default function LandingScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const sliderRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  const isCompact = width < 380 || height < 700;
  const isNarrow = width < 430;
  const horizontalPadding = Math.max(UiTheme.spacing.md, Math.round(width * 0.06));
  const titleSize = isCompact ? 26 : 30;
  const titleLineHeight = isCompact ? 30 : 34;
  const overlayPaddingBottom = Math.max(UiTheme.spacing.md, Math.round(height * 0.03));

  const slideWidth = width;

  function onSliderScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const { contentOffset } = event.nativeEvent;
    const index = Math.round(contentOffset.x / slideWidth);
    if (index !== activeIndex && index >= 0 && index < HERO_SLIDES.length) {
      setActiveIndex(index);
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const next = activeIndex === HERO_SLIDES.length - 1 ? 0 : activeIndex + 1;
      sliderRef.current?.scrollTo({ x: slideWidth * next, y: 0, animated: true });
      setActiveIndex(next);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeIndex, slideWidth]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={UiTheme.colors.page} />

      <View style={styles.heroContainer}>
        <View style={[styles.heroTopOverlay, { paddingHorizontal: horizontalPadding }]}>
          <View style={styles.welcomeHeaderInline}>
            <ThemedText type="title" style={[styles.welcomeHeader, { fontSize: titleSize, lineHeight: titleLineHeight }]}>Welcome to FIT-AI</ThemedText>
          </View>
        </View>

        <ScrollView
          ref={sliderRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onSliderScroll}
          scrollEventThrottle={16}
          style={styles.slider}
          contentContainerStyle={styles.sliderContent}
        >
          {HERO_SLIDES.map((slide) => (
            <View key={slide.key} style={[styles.heroSlide, { width: slideWidth }]}>
              <Image source={slide.image} style={styles.heroImage} contentFit="cover" />
            </View>
          ))}
        </ScrollView>

        <View
          style={[
            styles.heroOverlay,
            {
              paddingHorizontal: horizontalPadding,
              paddingBottom: overlayPaddingBottom,
              gap: UiTheme.spacing.sm,
            },
          ]}
        >
          <View style={styles.heroTopRow}>
            <View style={[styles.heroTitleWrap, isNarrow ? styles.heroTitleWrapNarrow : null]}>
              <ThemedText style={styles.heroDescriptionTitle}>{HERO_SLIDES[activeIndex].title}</ThemedText>
            </View>
            <View style={[styles.heroCtaWrap, isNarrow ? styles.heroCtaWrapNarrow : null]}>
              <Button title="Get Started" size="md" onPress={() => setModalVisible(true)} style={{ width: '100%' }} />
            </View>
          </View>

          <View style={styles.heroDescriptionRow}>
            <ThemedText style={styles.heroDescription}>{HERO_SLIDES[activeIndex].description}</ThemedText>
          </View>
        </View>
      </View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText type="title" style={styles.modalTitle}>Get Started</ThemedText>
            <Button
              title="Create account"
              onPress={() => {
                setModalVisible(false);
                router.push('/signup' as Href);
              }}
            />
            <Button
              title="I already have an account"
              variant="secondary"
              onPress={() => {
                setModalVisible(false);
                router.push('/login' as Href);
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: UiTheme.colors.page,
  },
  heroContainer: {
    width: '100%',
    flex: 1,
    position: 'relative',
    borderRadius: 0,
    overflow: 'hidden',
  },
  welcomeHeader: {
    color: UiTheme.colors.surface,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '900',
    padding: UiTheme.spacing.sm,
    backgroundColor: 'rgba(18, 58, 115, 0.92)',
    borderRadius: UiTheme.radius.md,
  },
  welcomeHeaderInline: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  heroTopOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: UiTheme.spacing.md,
    alignItems: 'center',
    zIndex: 20,
  },
  slider: {
    ...StyleSheet.absoluteFillObject,
  },
  sliderContent: {
    alignItems: 'stretch',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: UiTheme.colors.surface,
    borderRadius: UiTheme.radius.lg,
    padding: UiTheme.spacing.lg,
    width: '80%',
    alignItems: 'center',
    gap: UiTheme.spacing.md,
  },
  modalTitle: {
    color: UiTheme.colors.textPrimary,
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },

  heroSlide: {
    backgroundColor: UiTheme.colors.surface,
    flex: 1,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.38)',
    paddingTop: UiTheme.spacing.sm,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: UiTheme.spacing.sm,
  },
  heroTitleWrap: {
    flex: 9.3,
  },
  heroTitleWrapNarrow: {
    flex: 1,
  },
  heroDescriptionRow: {
    width: '100%',
  },
  heroDescriptionTitle: {
    color: UiTheme.colors.surface,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 6,
    flexShrink: 1,
  },
  heroDescription: {
    color: UiTheme.colors.surface,
    fontSize: 15,
    lineHeight: 20,
  },
  heroCtaWrap: {
    flex: 0.7,
    alignSelf: 'flex-end',
  },
  heroCtaWrapNarrow: {
    flex: 0.7,
  },
});
