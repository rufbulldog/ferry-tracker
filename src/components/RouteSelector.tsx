import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, ROUTE_GROUP_LABELS } from '../context/RouteContext';

type RouteGroup = 'bainbridge' | 'kingston';

export function RouteSelector() {
  const insets = useSafeAreaInsets();
  const { routeGroup, setRouteGroup, direction, setDirection, directionLabels } = useRoute();
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelectRoute = (group: RouteGroup) => {
    setRouteGroup(group);
    setModalVisible(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Route Group Dropdown - Pill Style */}
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="boat-outline" size={18} color="#1565C0" />
        <Text style={styles.dropdownText}>{ROUTE_GROUP_LABELS[routeGroup]}</Text>
        <Ionicons name="chevron-down" size={16} color="#999" />
      </TouchableOpacity>

      {/* Direction Toggle - Pill Buttons */}
      <View style={styles.directionRow}>
        <TouchableOpacity
          style={[
            styles.directionButton,
            direction === 'outbound' && styles.directionButtonActive,
          ]}
          onPress={() => setDirection('outbound')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.directionText,
              direction === 'outbound' && styles.directionTextActive,
            ]}
          >
            {directionLabels.outbound}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.directionButton,
            direction === 'inbound' && styles.directionButtonActive,
          ]}
          onPress={() => setDirection('inbound')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.directionText,
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
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Route</Text>
            <TouchableOpacity
              style={[styles.option, routeGroup === 'bainbridge' && styles.optionSelected]}
              onPress={() => handleSelectRoute('bainbridge')}
            >
              <Text style={[styles.optionText, routeGroup === 'bainbridge' && styles.optionTextSelected]}>
                Bainbridge - Seattle
              </Text>
              {routeGroup === 'bainbridge' && (
                <Ionicons name="checkmark" size={20} color="#1565C0" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.option, routeGroup === 'kingston' && styles.optionSelected]}
              onPress={() => handleSelectRoute('kingston')}
            >
              <Text style={[styles.optionText, routeGroup === 'kingston' && styles.optionTextSelected]}>
                Kingston - Edmonds
              </Text>
              {routeGroup === 'kingston' && (
                <Ionicons name="checkmark" size={20} color="#1565C0" />
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
    backgroundColor: '#f5f5f5',
  },
  // Pill-style dropdown
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
  // Direction toggle row
  directionRow: {
    flexDirection: 'row',
    backgroundColor: '#e0e0e0',
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
    backgroundColor: '#1565C0',
    shadowColor: '#1565C0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  directionText: {
    fontSize: 15,
    color: '#666',
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
    backgroundColor: '#fff',
    borderRadius: 12,
    minWidth: 300,
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionSelected: {
    backgroundColor: '#E3F2FD',
  },
  optionText: {
    fontSize: 15,
    color: '#333',
  },
  optionTextSelected: {
    color: '#1565C0',
    fontWeight: '500',
  },
});
