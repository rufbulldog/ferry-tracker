import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, ROUTE_GROUP_LABELS } from '../context/RouteContext';
import { useTheme } from '../context/ThemeContext';

type RouteGroup = 'bainbridge' | 'kingston';

export function RouteSelector() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { routeGroup, setRouteGroup, direction, setDirection, directionLabels } = useRoute();
  const [modalVisible, setModalVisible] = useState(false);
  const { theme } = useTheme();

  const handleSelectRoute = (group: RouteGroup) => {
    setRouteGroup(group);
    setModalVisible(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.pageBg }]}>
      {/* Route Group Dropdown - Pill Style */}
      <TouchableOpacity
        style={[styles.dropdown, { backgroundColor: theme.colors.cardBg }]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="boat-outline" size={18} color={theme.colors.primary} />
        <Text style={[styles.dropdownText, { color: theme.colors.text }]}>{ROUTE_GROUP_LABELS[routeGroup]}</Text>
        <Ionicons name="chevron-down" size={16} color={theme.colors.textMuted} />
      </TouchableOpacity>

      {/* Schedule planner — future-day schedules + leave-by estimates */}
      <TouchableOpacity
        style={[styles.plannerButton, { top: insets.top + 4, backgroundColor: theme.colors.cardBg }]}
        onPress={() => router.push('/planner')}
        activeOpacity={0.7}
        hitSlop={10}
        accessibilityLabel="Plan a future trip"
      >
        <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
      </TouchableOpacity>

      {/* Direction Toggle - Pill Buttons */}
      <View style={[styles.directionRow, { backgroundColor: theme.colors.inputBg }]}>
        <TouchableOpacity
          style={[
            styles.directionButton,
            direction === 'outbound' && [styles.directionButtonActive, { backgroundColor: theme.colors.primary }],
          ]}
          onPress={() => setDirection('outbound')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.directionText,
              { color: theme.colors.textMuted },
              direction === 'outbound' && styles.directionTextActive,
            ]}
          >
            {directionLabels.outbound}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.directionButton,
            direction === 'inbound' && [styles.directionButtonActive, { backgroundColor: theme.colors.primary }],
          ]}
          onPress={() => setDirection('inbound')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.directionText,
              { color: theme.colors.textMuted },
              direction === 'inbound' && styles.directionTextActive,
            ]}
          >
            {directionLabels.inbound}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Dropdown Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.cardBg }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text, borderBottomColor: theme.colors.border }]}>Select Route</Text>
            <TouchableOpacity
              style={[styles.option, { borderBottomColor: theme.colors.border }, routeGroup === 'bainbridge' && { backgroundColor: theme.colors.inputBg }]}
              onPress={() => handleSelectRoute('bainbridge')}
            >
              <Text style={[styles.optionText, { color: theme.colors.text }, routeGroup === 'bainbridge' && { color: theme.colors.primary }]}>
                Bainbridge - Seattle
              </Text>
              {routeGroup === 'bainbridge' && (
                <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.option, { borderBottomColor: theme.colors.border }, routeGroup === 'kingston' && { backgroundColor: theme.colors.inputBg }]}
              onPress={() => handleSelectRoute('kingston')}
            >
              <Text style={[styles.optionText, { color: theme.colors.text }, routeGroup === 'kingston' && { color: theme.colors.primary }]}>
                Kingston - Edmonds
              </Text>
              {routeGroup === 'kingston' && (
                <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  // Pill-style dropdown
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    marginBottom: 12,
  },
  dropdownText: {
    fontSize: 15,
    fontWeight: '600',
  },
  // Calendar/planner button — floats at the top-right, aligned with the dropdown.
  plannerButton: {
    position: 'absolute',
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Direction toggle row
  directionRow: {
    flexDirection: 'row',
    borderRadius: 24,
    padding: 4,
  },
  directionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  directionButtonActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  directionText: {
    fontSize: 15,
    fontWeight: '500',
  },
  directionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 12,
    minWidth: 300,
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    padding: 16,
    borderBottomWidth: 1,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
