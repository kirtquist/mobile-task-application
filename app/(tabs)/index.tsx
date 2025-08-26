import React, {use, useState} from 'react';
import { Image } from 'expo-image';
import { Platform, StyleSheet, SafeAreaView } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {ExternalLink} from "@/components/ExternalLink";
// import LoginCard from "../../components/LoginCard"; //
// import { useAuth } from "../../contexts/AuthContext";
import { useAuth} from "@/hooks/useAuth";
import { useLoginHandler} from "@/hooks/auth";


export default function HomeScreen() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const {user} = useAuth();
    const logout = async () => {
        // ...perform logout...
        setIsAuthenticated(false);
    };


  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/debt-help-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome {user?.username ?? 'Guest'}!</ThemedText>
        <HelloWave />

      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 2: Explore</ThemedText>
        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          {`When you're ready, run `}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
<ThemedView style={styles.stepContainer}>
    <ThemedText type="subtitle">Step 4: Get some debt relief</ThemedText>
        <ExternalLink href="https://io.debt.help">
            <ThemedText type="link">IO Debt Help </ThemedText>
        </ExternalLink>
</ThemedView>

    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});

const styles2 = StyleSheet.create({
    screen: { flex: 1, backgroundColor: "#f3f4f6" },
});