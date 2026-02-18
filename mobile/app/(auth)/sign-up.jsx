import { useState } from "react";
import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import {
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { styles } from "@/assets/styles/auth.styles.js";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors.js";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scrollview";

export default function Page() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return;

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
      });

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // Set 'pendingVerification' to true to display second form
      // and capture code
      setPendingVerification(true);
    } catch (err) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      // console.error(JSON.stringify(err, null, 2));
      if (err.errors?.[0]?.code === "form_identifier_exists") {
        setError(
          "Email already in use. Please sign in or use a different email.",
        );
      }
      if (err.errors?.[0]?.code === "form_password_pwned") {
        setError(
          "This password has been compromised in a data breach. Please choose a different password.",
        );
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === "complete") {
        await setActive({
          session: signUpAttempt.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              // Check for tasks and navigate to custom UI to help users resolve them
              // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
              console.log(session?.currentTask);
              return;
            }

            router.replace("/");
          },
        });
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        // console.error(JSON.stringify(signUpAttempt, null, 2));

        if (signUpAttempt.status === "verification_code_incorrect") {
          setError("Incorrect verification code. Please try again.");
        }
      }
    } catch (err) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      // console.error(JSON.stringify(err, null, 2));

      if (err.errors?.[0]?.code === "form_identifier_exists") {
        setError(
          "Email already in use. Please sign in or use a different email.",
        );
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  if (pendingVerification) {
    return (
      <View style={styles.verificationContainer}>
        <Text type="title" style={styles.verificationTitle}>
          Verify your email
        </Text>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setError(null)}>
              <Ionicons name="close" size={20} color={COLORS.expense} />
            </TouchableOpacity>
          </View>
        ) : null}

        <TextInput
          style={[styles.verificationInput, error && styles.errorInput]}
          value={code}
          placeholder="Enter your verification code"
          placeholderTextColor="#666666"
          onChangeText={(code) => setCode(code)}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.button} onPress={onVerifyPress}>
          <Text style={styles.buttonText}>Verify</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      extraScrollHeight={300}
    >
      <View style={styles.container}>
        <Image
          source={require("@/assets/images/ui-images/revenue-i2.png")}
          style={styles.illustration}
        />

        <Text type="title" style={styles.title}>
          Sign up
        </Text>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setError(null)}>
              <Ionicons name="close" size={20} color={COLORS.expense} />
            </TouchableOpacity>
          </View>
        ) : null}

        {/* <Text style={styles.label}>Email address</Text> */}
        <TextInput
          style={styles.input}
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Enter email"
          placeholderTextColor="#666666"
          onChangeText={(email) => setEmailAddress(email)}
          keyboardType="email-address"
        />
        {/* <Text style={styles.label}>Password</Text> */}
        <TextInput
          style={styles.input}
          value={password}
          placeholder="Enter password"
          placeholderTextColor="#666666"
          secureTextEntry={true}
          onChangeText={(password) => setPassword(password)}
        />
        <Pressable
          style={styles.button}
          onPress={onSignUpPress}
          disabled={!emailAddress || !password}
        >
          <Text style={styles.buttonText}>Sign up</Text>
        </Pressable>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Have an account? </Text>
          <Link href="/sign-in">
            <Text type="link" style={styles.linkText}>
              Sign in
            </Text>
          </Link>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     gap: 12,
//   },
//   title: {
//     marginBottom: 8,
//   },
//   description: {
//     fontSize: 14,
//     marginBottom: 16,
//     opacity: 0.8,
//   },
//   label: {
//     fontWeight: '600',
//     fontSize: 14,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 8,
//     padding: 12,
//     fontSize: 16,
//     backgroundColor: '#fff',
//   },
//   button: {
//     backgroundColor: '#0a7ea4',
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginTop: 8,
//   },
//   buttonPressed: {
//     opacity: 0.7,
//   },
//   buttonDisabled: {
//     opacity: 0.5,
//   },
//   buttonText: {
//     color: '#fff',
//     fontWeight: '600',
//   },
//   linkContainer: {
//     flexDirection: 'row',
//     gap: 4,
//     marginTop: 12,
//     alignItems: 'center',
//   },
// })
