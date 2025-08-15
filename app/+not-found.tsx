import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { AlertTriangle } from "@/components/icons";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Page Not Found" }} />
      <View style={styles.container}>
        <AlertTriangle size={64} color="#EF4444" style={styles.icon} />
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.subtitle}>The page you&apos;re looking for doesn&apos;t exist.</Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to Timer</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#F9FAFB",
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 32,
  },
  link: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  linkText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
