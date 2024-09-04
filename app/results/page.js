'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import getStripe from "@/utils/get-stripe"
import { useSearchParams } from "next/navigation"
import { Box, Container, Typography, CircularProgress } from "@mui/material"

const ResultPage = () => {

    const router = useRouter()
    const searchParams = useSearchParams()
    const sessionId = searchParams.get('session_id')

    const [loading, setLoading] = useState(true)
    const [session, setSession] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchCheckoutSession = async () => {
            if (!sessionId) return

            try {
                const res = await fetch(`/api/checkout_session?session_id=${sessionId}`)
                const sessionData = await res.json()
                if (res.ok) {
                    setSession(sessionData)
                }
                else {
                    setError(sessionData.error)
                }
            }
            catch (err) {
                setError("An error occurred")
            } finally {
                setLoading(false)
            }
        }
        fetchCheckoutSession()

    }), [sessionId]

    if (loading) {
        return (

            <Container maxWidth='100vw' sx={{
                display: 'flex',
                mt: 4,
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>

                <CircularProgress />
                <Typography variant='h6' sx={{ ml: 2 }}>Loading...</Typography>
            </Container>
        )
    }

    if (error) {
        return (
            <Container maxWidth='100vw' sx={{
                display: 'flex',
                mt: 4,
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <Typography variant='h6' color='error'>{error}</Typography>
            </Container>
        )
    }

    return (
        <Container maxWidth='100vw' sx={{
            display: 'flex',
            mt: 4,
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh'
        }}>
            {session.payment_status === 'paid' ? (

                <>
                    <Typography variant='h4'>Your purchase was successful!</Typography>
                    <Box sx={{ mt: 22 }}>
                        <Typography variant='h6' textAlign={'center'}>Session ID:{sessionId}</Typography>
                        <Typography variant='b1'>We have received your payment. You will receive an email with your order details shortly.</Typography>
                    </Box>
                </>
            ) : (
                <>
                    <Box sx={{ mt: 20 }}  >
                        <Typography variant='h3' color="inherit" textAlign={'center'} sx={{ mb: 12 }}>Payment Failed!</Typography>

                        <Typography variant='b1'>Your payment was not successful. Please try again!</Typography>
                    </Box>
                </>
            )}
        </Container>
    )
}
export default ResultPage