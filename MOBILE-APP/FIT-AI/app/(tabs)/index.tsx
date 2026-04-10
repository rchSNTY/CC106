import { Image } from 'expo-image';
import { Href, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { UiTheme } from '@/constants/ui-theme';

const CAPABILITY_SLIDES = [
  {
    title: 'Personalized Plans',
    description: 'FIT-AI creates workout suggestions based on your profile and selected activity level.',
  },
  {
    title: 'Workout Discovery',
    description: 'Browse routines by type and intensity, then save the ones you want to repeat.',
  },
  {
    title: 'Progress Tracking',
    description: 'Check your activity log, streak, and weekly goals to stay consistent over time.',
  },
] as const;

export default function LandingScreen() {
  const router = useRouter();
  const sliderRef = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);

  const slideWidth = Math.max(width - UiTheme.spacing.lg * 2, 280);

  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < CAPABILITY_SLIDES.length - 1;

  const currentSlide = useMemo(() => CAPABILITY_SLIDES[activeIndex], [activeIndex]);

  function onSliderScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const { contentOffset, layoutMeasurement } = event.nativeEvent;
    const width = layoutMeasurement.width;
    if (!width) {
      return;
    }

    const index = Math.round(contentOffset.x / width);
    if (index !== activeIndex && index >= 0 && index < CAPABILITY_SLIDES.length) {
      setActiveIndex(index);
    }
  }

  function goToSlide(nextIndex: number) {
    sliderRef.current?.scrollTo({ x: slideWidth * nextIndex, y: 0, animated: true });
    setActiveIndex(nextIndex);
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        const next = prev === CAPABILITY_SLIDES.length - 1 ? 0 : prev + 1;
        sliderRef.current?.scrollTo({ x: slideWidth * next, y: 0, animated: true });
        return next;
      });
    }, 3200);

    return () => clearInterval(timer);
  }, [slideWidth]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={UiTheme.colors.page} />

      <View style={styles.container}>
        <Image source={require('@/assets/images/Logo.png')} style={styles.logo} contentFit="contain" />
        <ThemedText type="title" style={styles.title}>Train Smarter with FIT-AI</ThemedText>
        <ThemedText style={styles.subtitle}>Your fitness companion for planning, tracking, and improving every week.</ThemedText>

        <View style={styles.sliderOuter}>
          <ScrollView
            ref={sliderRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onSliderScroll}
            contentContainerStyle={styles.sliderContent}
          >
            {CAPABILITY_SLIDES.map((slide) => (
              <View key={slide.title} style={[styles.slideCard, { width: slideWidth }]}>
                <ThemedText style={styles.slideTitle}>{slide.title}</ThemedText>
                <ThemedText style={styles.slideDescription}>{slide.description}</ThemedText>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.dotsRow}>
          {CAPABILITY_SLIDES.map((slide, idx) => (
            <View key={slide.title} style={[styles.dot, idx === activeIndex ? styles.dotActive : null]} />
          ))}
        </View>

        <View style={styles.previewCard}>
          <ThemedText style={styles.previewLabel}>Now Viewing</ThemedText>
          <ThemedText style={styles.previewTitle}>{currentSlide.title}</ThemedText>
        </View>

        <View style={styles.navHintRow}>
          <TouchableOpacity
            onPress={() => goToSlide(Math.max(activeIndex - 1, 0))}
            disabled={!canGoPrev}
            style={[styles.navChip, !canGoPrev && styles.navChipDisabled]}
          >
            <ThemedText style={[styles.navChipText, !canGoPrev && styles.navChipTextDisabled]}>Previous</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => goToSlide(Math.min(activeIndex + 1, CAPABILITY_SLIDES.length - 1))}
            disabled={!canGoNext}
            style={[styles.navChip, !canGoNext && styles.navChipDisabled]}
          >
            <ThemedText style={[styles.navChipText, !canGoNext && styles.navChipTextDisabled]}>Next</ThemedText>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/signup' as Href)}>
          <ThemedText type="defaultSemiBold" style={styles.primaryButtonText}>Create Account</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/login' as Href)}>
          <ThemedText type="defaultSemiBold" style={styles.secondaryButtonText}>I already have an account</ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: UiTheme.colors.page,
  },
  container: {
    flex: 1,
    paddingHorizontal: UiTheme.spacing.lg,
    paddingTop: UiTheme.spacing.lg,
    paddingBottom: UiTheme.spacing.xl,
    backgroundColor: UiTheme.colors.page,
  },
  logo: {
    width: 88,
    height: 88,
    alignSelf: 'center',
    marginTop: UiTheme.spacing.xl,
    marginBottom: UiTheme.spacing.sm,
  },
  title: {
    color: UiTheme.colors.textPrimary,
    fontSize: 30,
    lineHeight: 34,
    textAlign: 'center',
    fontWeight: '900',
  },
  subtitle: {
    textAlign: 'center',
    color: UiTheme.colors.textSecondary,
    marginTop: UiTheme.spacing.xs,
    marginBottom: UiTheme.spacing.md,
    fontSize: 14,
  },
  sliderOuter: {
    width: '100%',
  },
  sliderContent: {
    alignItems: 'stretch',
  },
  slideCard: {
    minHeight: 180,
    backgroundColor: UiTheme.colors.surface,
    borderWidth: 1,
    borderColor: UiTheme.colors.border,
    borderRadius: UiTheme.radius.lg,
    padding: UiTheme.spacing.lg,
    justifyContent: 'center',
    gap: UiTheme.spacing.sm,
  },
  slideTitle: {
    color: UiTheme.colors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
  },
  slideDescription: {
    color: UiTheme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  dotsRow: {
    marginTop: UiTheme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: UiTheme.spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: UiTheme.colors.border,
  },
  dotActive: {
    width: 20,
    backgroundColor: UiTheme.colors.accent,
  },
  previewCard: {
    marginTop: UiTheme.spacing.md,
    backgroundColor: UiTheme.colors.surface,
    borderWidth: 1,
    borderColor: UiTheme.colors.border,
    borderRadius: UiTheme.radius.md,
    padding: UiTheme.spacing.md,
    gap: 4,
  },
  previewLabel: {
    color: UiTheme.colors.textSecondary,
    fontSize: UiTheme.font.caption,
    fontWeight: '700',
  },
  previewTitle: {
    color: UiTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  navHintRow: {
    marginTop: UiTheme.spacing.sm,
    flexDirection: 'row',
    gap: UiTheme.spacing.sm,
  },
  navChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: UiTheme.colors.border,
    borderRadius: UiTheme.radius.sm,
    backgroundColor: UiTheme.colors.surface,
    paddingVertical: UiTheme.spacing.xs + 2,
    alignItems: 'center',
  },
  navChipDisabled: {
    opacity: 0.45,
  },
  navChipText: {
    color: UiTheme.colors.textPrimary,
    fontWeight: '700',
  },
  navChipTextDisabled: {
    color: UiTheme.colors.textSecondary,
  },
  primaryButton: {
    marginTop: UiTheme.spacing.md,
    backgroundColor: UiTheme.colors.accent,
    borderRadius: UiTheme.radius.sm,
    alignItems: 'center',
    paddingVertical: 13,
  },
  primaryButtonText: {
    color: UiTheme.colors.surface,
    fontWeight: '800',
  },
  secondaryButton: {
    marginTop: UiTheme.spacing.sm,
    borderRadius: UiTheme.radius.sm,
    borderColor: UiTheme.colors.border,
    borderWidth: 1,
    alignItems: 'center',
    paddingVertical: 13,
    backgroundColor: UiTheme.colors.surface,
  },
  secondaryButtonText: {
    color: UiTheme.colors.textPrimary,
    fontWeight: '700',
  },
});
