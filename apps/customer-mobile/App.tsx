import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { JobStatus } from '@cleaners/shared';
import { api } from './src/lib/api';

type Screen = 'home' | 'book' | 'jobs' | 'favorites' | 'recurring';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [phone, setPhone] = useState('+10000000002');
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  async function login() {
    setLoading(true);
    setError(null);
    try {
      await api('/auth/otp/request', { method: 'POST', body: JSON.stringify({ phone }) });
      const res = await api<{ accessToken: string }>('/auth/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ phone, code: '123456', role: 'CUSTOMER' }),
      });
      setToken(res.accessToken);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  async function load(path: string) {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      setData(await api(path, { token }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      <Text style={styles.title}>CleanersApp — Customer</Text>
      <Text style={styles.subtitle}>v1 + v1.5 (no promo codes)</Text>

      {!token ? (
        <View style={styles.card}>
          <Text style={styles.label}>Phone (dev seed: +10000000002)</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} />
          <Pressable style={styles.button} onPress={login}>
            <Text style={styles.buttonText}>Sign in with OTP 123456</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView horizontal style={styles.tabs}>
            {(['home', 'book', 'jobs', 'favorites', 'recurring'] as Screen[]).map((tab) => (
              <Pressable key={tab} style={[styles.tab, screen === tab && styles.tabActive]} onPress={() => setScreen(tab)}>
                <Text>{tab}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {screen === 'home' && (
            <View style={styles.card}>
              <Text>• Book now / schedule</Text>
              <Text>• Live job status: {Object.keys(JobStatus).length} states</Text>
              <Text>• Favorites & recurring (v1.5)</Text>
              <Text>• In-app chat on active jobs</Text>
            </View>
          )}

          {screen === 'book' && (
            <Pressable style={styles.button} onPress={() => load('/service-types')}>
              <Text style={styles.buttonText}>Load service types</Text>
            </Pressable>
          )}
          {screen === 'jobs' && (
            <Pressable style={styles.button} onPress={() => load('/jobs')}>
              <Text style={styles.buttonText}>Load my jobs</Text>
            </Pressable>
          )}
          {screen === 'favorites' && (
            <Pressable style={styles.button} onPress={() => load('/favorites')}>
              <Text style={styles.buttonText}>Load favorites</Text>
            </Pressable>
          )}
          {screen === 'recurring' && (
            <Pressable style={styles.button} onPress={() => load('/recurring')}>
              <Text style={styles.buttonText}>Load recurring bookings</Text>
            </Pressable>
          )}
        </>
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
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, gap: 8 },
  label: { fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 10 },
  button: { backgroundColor: '#0f766e', padding: 14, borderRadius: 10, marginTop: 12 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  tabs: { marginVertical: 12, maxHeight: 44 },
  tab: { paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, backgroundColor: '#e2e8f0', borderRadius: 8 },
  tabActive: { backgroundColor: '#99f6e4' },
  error: { color: '#dc2626', marginTop: 8 },
  result: { flex: 1, marginTop: 12, backgroundColor: '#fff', borderRadius: 8, padding: 8 },
  mono: { fontFamily: 'monospace', fontSize: 11 },
});
