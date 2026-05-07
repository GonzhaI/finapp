import { StyleSheet, Text, View } from 'react-native';

export default function MovementsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Movimientos</Text>
      <Text style={styles.subtitle}>Próximamente</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 15,
    color: '#888',
    marginTop: 8,
  },
});
