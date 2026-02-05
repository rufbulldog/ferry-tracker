import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Text, SegmentedButtons } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, ROUTE_GROUP_LABELS } from '../context/RouteContext';

type RouteGroup = 'bainbridge' | 'kingston';

export function RouteSelector() {
  const { routeGroup, setRouteGroup, direction, setDirection, directionLabels } = useRoute();
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelectRoute = (group: RouteGroup) => {
    setRouteGroup(group);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Route Group Dropdown */}
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.dropdownText}>{ROUTE_GROUP_LABELS[routeGroup]}</Text>
        <Ionicons name="chevron-down" size={20} color="#1565C0" />
      </TouchableOpacity>

      {/* Direction Buttons */}
      <SegmentedButtons
        value={direction}
        onValueChange={(value) => setDirection(value as 'outbound' | 'inbound')}
        buttons={[
          {
            value: 'outbound',
            label: directionLabels.outbound,
            style: direction === 'outbound' ? styles.buttonSelected : styles.buttonUnselected,
            labelStyle: direction === 'outbound' ? styles.labelSelected : styles.labelUnselected,
          },
          {
            value: 'inbound',
            label: directionLabels.inbound,
            style: direction === 'inbound' ? styles.buttonSelected : styles.buttonUnselected,
            labelStyle: direction === 'inbound' ? styles.labelSelected : styles.labelUnselected,
          },
        ]}
        style={styles.segmentedButtons}
      />

      {/* Dropdown Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={[styles.option, routeGroup === 'bainbridge' && styles.optionSelected]}
              onPress={() => handleSelectRoute('bainbridge')}
            >
              {routeGroup === 'bainbridge' && (
                <Ionicons name="checkmark" size={20} color="#1565C0" style={styles.checkIcon} />
              )}
              <Text style={[styles.optionText, routeGroup === 'bainbridge' && styles.optionTextSelected]}>
                Bainbridge - Seattle
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.option, routeGroup === 'kingston' && styles.optionSelected]}
              onPress={() => handleSelectRoute('kingston')}
            >
              {routeGroup === 'kingston' && (
                <Ionicons name="checkmark" size={20} color="#1565C0" style={styles.checkIcon} />
              )}
              <Text style={[styles.optionText, routeGroup === 'kingston' && styles.optionTextSelected]}>
                Kingston - Edmonds
              </Text>
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
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#1565C0',
    borderRadius: 4,
    marginBottom: 12,
  },
  dropdownText: {
    fontSize: 16,
    color: '#1565C0',
    fontWeight: '500',
  },
  segmentedButtons: {
    marginBottom: 4,
  },
  buttonSelected: {
    backgroundColor: '#1565C0',
    borderColor: '#1565C0',
  },
  buttonUnselected: {
    backgroundColor: '#fff',
    borderColor: '#1565C0',
  },
  labelSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  labelUnselected: {
    color: '#1565C0',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    minWidth: 280,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionSelected: {
    backgroundColor: '#E3F2FD',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  optionTextSelected: {
    color: '#1565C0',
    fontWeight: '500',
  },
  checkIcon: {
    marginRight: 12,
  },
});
