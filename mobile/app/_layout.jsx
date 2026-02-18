import { Stack } from "expo-router";
import SafeScreen from "@/components/safeSpace";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <SafeScreen>
        <Stack screenOptions={{headerShown:false}}/>
        <StatusBar style="auto" />
      </SafeScreen>
    </ClerkProvider>
  );
}
