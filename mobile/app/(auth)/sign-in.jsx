import { useSignIn } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import {useState, useCallback} from 'react'
import { Pressable, TextInput, View, Text, Image, TouchableOpacity } from 'react-native'
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview'
import {styles} from "@/assets/styles/auth.styles.js"
import {Ionicons} from "@expo/vector-icons"
import {COLORS} from "@/constants/colors.js"

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [showEmailCode, setShowEmailCode] = useState(false)
  const [error, setError] = useState(null)

  // Handle the submission of the sign-in form
  const onSignInPress = useCallback(async () => {
    if (!isLoaded) return

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      })

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === 'complete') {
        await setActive({
          session: signInAttempt.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              // Check for tasks and navigate to custom UI to help users resolve them
              // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
              console.log(session?.currentTask)
              return
            }

            router.replace('/')
          },
        })
      } else if (signInAttempt.status === 'needs_second_factor') {
        // Check if email_code is a valid second factor
        // This is required when Client Trust is enabled and the user
        // is signing in from a new device.
        // See https://clerk.com/docs/guides/secure/client-trust
        const emailCodeFactor = signInAttempt.supportedSecondFactors?.find(
            (factor) => factor.strategy === 'email_code'
        )

        if (emailCodeFactor) {
          await signIn.prepareSecondFactor({
            strategy: 'email_code',
            emailAddressId: emailCodeFactor.emailAddressId,
          })
          setShowEmailCode(true)
        }
      } else {
        if (signInAttempt.status === 'form_password_incorrect ') {
          setError('Invalid credentials. Please try again.')
        }
      }
    } catch (err) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      // console.error(JSON.stringify(err, null, 2))
      setError('Invalid credentials. Please try again.')
    }
  }, [isLoaded, signIn, setActive, router, emailAddress, password])

  // Handle the submission of the email verification code
  const onVerifyPress = useCallback(async () => {
    if (!isLoaded) return

    try {
      const signInAttempt = await signIn.attemptSecondFactor({
        strategy: 'email_code',
        code,
      })

      if (signInAttempt.status === 'complete') {
        await setActive({
          session: signInAttempt.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              // Check for tasks and navigate to custom UI to help users resolve them
              // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
              console.log(session?.currentTask)
              return
            }

            router.replace('/')
          },
        })
      } else {
        // console.error(JSON.stringify(signInAttempt, null, 2))
        setError('Invalid credentials. Please try again.')
      }
    } catch (err) {
      // console.error(JSON.stringify(err, null, 2))
        setError('Invalid credentials. Please try again.')

    }
  }, [isLoaded, signIn, setActive, router, code])

  // Display email code verification form
  if (showEmailCode) {
    return (
      <View style={styles.container}>
        <Text type="title" style={styles.title}>
          Verify your email
        </Text>
        <Text style={styles.description}>
          A verification code has been sent to your email.
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
          style={styles.input}
          value={code}
          placeholder="Enter verification code"
          placeholderTextColor="#666666"
          onChangeText={(code) => setCode(code)}
          keyboardType="numeric"
        />
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={onVerifyPress}
        >
          <Text style={styles.buttonText}>Verify</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <KeyboardAwareScrollView
          style={{flex: 1}}
          contentContainerStyle={{flexGrow: 1}}
          enableOnAndroid={true}
          enableAutomaticScroll={true}
          extraScrollHeight={300}
    >
      <View style={styles.container}>
        <Image source={require('@/assets/images/ui-images/revenue-i4.png')} style={styles.illustration} />
    
      <Text type="title" style={styles.title}>
        Welcome Back!
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
        onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
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
        style={({ pressed }) => [
          styles.button,
          (!emailAddress || !password) && styles.buttonDisabled,
          pressed && styles.buttonPressed,
        ]}
        onPress={onSignInPress}
        disabled={!emailAddress || !password}
      >
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>Don&apos;t have an account? </Text>
        <Link href="/sign-up">
          <Text type="link" style={styles.linkText}>Sign up</Text>
        </Link>
      </View>
    </View>
    </KeyboardAwareScrollView>
  )
}