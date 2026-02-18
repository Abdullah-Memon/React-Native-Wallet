import { SignOutButton } from '@/components/sign-out-button'
import { SignedIn, useSession, useUser } from '@clerk/clerk-expo'
import { StyleSheet, Text, View } from 'react-native'
import { useTransactions } from '../../hooks/useTransactions.js'
import { useEffect } from 'react'

export default function Page() {
  const { user } = useUser()
  const { transactions, summary, loading, loadData, deleteTransaction } = useTransactions(user.id)

  useEffect(() => {
    loadData()
  }, [user.id, loadData])

  // If your user isn't appearing as signed in,
  // it's possible they have session tasks to complete.
  // Learn more: https://clerk.com/docs/guides/configure/session-tasks
  const { session } = useSession()
  console.log(session?.currentTask)

  return (
    <View style={styles.container}>
      <Text type="title">Welcome!</Text>
      <SignedIn>
        <Text>Hello {user?.emailAddresses[0].emailAddress}</Text>
        <SignOutButton />
      </SignedIn>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
})