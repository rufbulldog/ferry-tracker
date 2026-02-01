import { View, StyleSheet } from 'react-native';
import { Text, List, Switch } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

export default function SettingsScreen() {
  const [defaultToSeattle, setDefaultToSeattle] = useState(true);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <List.Section>
          <List.Subheader>Preferences</List.Subheader>
          <List.Item
            title="Default departure terminal"
            description={defaultToSeattle ? 'Seattle' : 'Bainbridge'}
            left={(props) => <List.Icon {...props} icon="ferry" />}
            right={() => (
              <Switch
                value={defaultToSeattle}
                onValueChange={setDefaultToSeattle}
              />
            )}
          />
        </List.Section>

        <List.Section>
          <List.Subheader>About</List.Subheader>
          <List.Item
            title="Version"
            description="1.0.0"
            left={(props) => <List.Icon {...props} icon="information" />}
          />
          <List.Item
            title="Data Source"
            description="Washington State Ferries API"
            left={(props) => <List.Icon {...props} icon="database" />}
          />
        </List.Section>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
});
