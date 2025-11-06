import { Button, ScrollView, StyleSheet } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { api } from '@/lib/trpc-provider';
import { authClient } from '../../lib/auth';

export default function HomeScreen() {
  const { data: users, error } = api.user.getUsers.useQuery();
  const { data: usersProtected, error: errorProtected } = api.user.getUsersProtected.useQuery();



  return (
    <ScrollView
      contentContainerStyle={{ paddingTop: 75 }}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView>
        {users?.map((user) => (
          <ThemedText key={user.id}>{user.name}</ThemedText>
        ))}
        {error && <ThemedText>{error.message}</ThemedText>}
      </ThemedView>
      <ThemedView>
        <ThemedText type="title">Protected Users</ThemedText>
        {usersProtected?.map((user) => (
          <ThemedText key={user.id}>{user.name}</ThemedText>
        ))}
        {errorProtected && <ThemedText>{errorProtected.message}</ThemedText>}
      </ThemedView>

      <SampleButtons />
    </ScrollView>
  );
}

function SampleButtons() {
  const utils = api.useUtils();
  const session = authClient.useSession();

  function createUser() {
    authClient.signUp.email({
      email: "test" + Math.random() + "@example.com",
      password: "password",
      name: "Test User " + Math.random(),
    });

    utils.user.getUsers.invalidate();
    utils.user.getUsersProtected.invalidate();
  }


  return (
    <ThemedView>
      <ThemedText type="title">Create User</ThemedText>
      {session.data?.user ? (
        <>
          <ThemedText type="title">Signed in as {session.data.user.email}</ThemedText>
          <Button title="Sign Out" onPress={() => authClient.signOut()} />
        </>
      ) : (
        <Button title="Create User" onPress={createUser} />
      )}
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: "100%",
    flex: 1
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
