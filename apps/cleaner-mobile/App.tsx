import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { api } from './src/lib/api';

export default function App() {
  const [phone, setPhone] = useState('+10000000003');
  const [token, setToken] = useState<string | null>(null);
  const [online, setOnline] = useState(true);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  async function login() {
    setLoading(true);
    setError(null);
    try {
      const res = await api<{ accessToken: string }>('/auth/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ phone, code: '123456', role: 'CLEANER' }),
      });
      setToken(res.accessToken);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  async function setPresence() {
    if (!token) return;
    setLoading(true);
    try {
      await api('/cleaners/presence', {
        method: 'PATCH',
        token,
        body: JSON.stringify({ isOnline: online, lat: 32.09, lng: 34.78 }),
      });
      setData({ online, lat: 32.09, lng: 34.78 });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  async function loadJobs() {
    if (!token) return;
    setLoading(true);
    try {
      setData(await api('/jobs', { token }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  async function loadEarnings() {
    if (!token) return;
    setLoading(true);
    try {
      setData(await api('/cleaners/earnings', { token }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      <Text style={styles.title}>CleanersApp — Cleaner</Text>
      <Text style={styles.subtitle}>Offers, status updates, checklist & photos</Text>

      {!token ? (
        <View style={styles.card}>
          <Text style={styles.label}>Phone (dev seed: +10000000003)</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} />
          <Pressable style={styles.button} onPress={login}>
            <Text style={styles.buttonText}>Sign in</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.card}>
          <View style={styles.row}>
            <Text>Go online</Text>
            <Switch value={online} onValueChange={setOnline} />
          </View>
          <Pressable style={styles.button} onPress={setPresence}>
            <Text style={styles.buttonText}>Update presence</Text>
          </Pressable>
          <Pressable style={styles.buttonSecondary} onPress={loadJobs}>
            <Text style={styles.buttonText}>Job offers & assignments</Text>
          </Pressable>
          <Pressable style={styles.buttonSecondary} onPress={loadEarnings}>
            <Text style={styles.buttonText}>Earnings</Text>
          </Pressable>
        </View>
      )}

      {loading && <ActivityIndicator style={{ marginTop: 12 }} />}
      {error && <Text style={styles.error}>{error}</Text>}
      {data != null && (
        <ScrollView style={styles.result}>
          <Text style={styles.mono}>{JSON.stringify(data, null, 2)}</Text>
        </ScrollView>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: 56, paddingHorizontal: 16, backgroundColor: '#f8fafc' },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { color: '#64748b', marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, gap: 12 },
  label: { fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  button: { backgroundColor: '#0f766e', padding: 14, borderRadius: 10 },
  buttonSecondary: { backgroundColor: '#115e59', padding: 14, borderRadius: 10 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  error: { color: '#dc2626', marginTop: 8 },
  result: { flex: 1, marginTop: 12, backgroundColor: '#fff', borderRadius: 8, padding: 8 },
  mono: { fontFamily: 'monospace', fontSize: 11 },
});
