import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import type { ProcessedBulletin } from '../hooks/useTerminalBulletins';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AlertBannerProps {
  alert: ProcessedBulletin;
}

export function AlertBanner({ alert }: AlertBannerProps) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const timeSinceUpdate = () => {
    // "x ago" label needs the current wall-clock time; recomputed on each render.
    // eslint-disable-next-line react-hooks/purity
    const minutes = Math.floor((Date.now() - alert.lastUpdated.getTime()) / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  // Determine if this is an urgent alert (route-specific) or general info
  const isUrgent = alert.isAlert && alert.isRouteSpecific;

  const containerStyle = isUrgent ? styles.containerUrgent : styles.containerInfo;
  const iconName = isUrgent ? 'warning' : 'information-circle';
  const iconColor = isUrgent ? '#fff' : '#fff';

  return (
    <TouchableOpacity
      style={[styles.container, containerStyle]}
      onPress={toggleExpanded}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={iconName} size={24} color={iconColor} />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={expanded ? undefined : 1}>
            {alert.title}
          </Text>
          <Text style={styles.time}>{timeSinceUpdate()}</Text>
        </View>
        <Text style={styles.text} numberOfLines={expanded ? undefined : 2}>
          {alert.text}
        </Text>
        {expanded && (
          <Text style={styles.tapHint}>Tap to collapse</Text>
        )}
      </View>
      <Ionicons
        name={expanded ? "chevron-up" : "chevron-down"}
        size={20}
        color="rgba(255,255,255,0.7)"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  containerUrgent: {
    backgroundColor: '#C62828', // Red for urgent alerts
  },
  containerInfo: {
    backgroundColor: '#1565C0', // Blue for general info
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    flex: 1,
  },
  time: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    marginLeft: 8,
  },
  text: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    lineHeight: 18,
  },
  tapHint: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    marginTop: 8,
    fontStyle: 'italic',
  },
});
