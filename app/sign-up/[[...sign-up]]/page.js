'use client'
import { SignIn, SignUp } from "@clerk/nextjs";
import { AppBar, Container, Toolbar, Button, Box, Typography } from "@mui/material";
import App from "next/app";
import Link from "next/link";


export default function SignUpPage() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'White' }}>
      <AppBar position="fixed" sx={{ backgroundColor: '#008B8B', width: '100%' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Flashcards For Fun
          </Typography>
          <Link href="/" passHref>
            <Button sx={{ color: "white", fontFamily: 'Monospace' }}>
              Home
            </Button>
          </Link>
          <Link href="/sign-in" passHref>
            <Button sx={{ color: "white" }}>
              Login
            </Button>
          </Link>
        </Toolbar>
      </AppBar>
      <Container
        sx={{
          flexGrow: 1,
          pt: 8, // Adjust padding-top to account for the fixed AppBar
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h4" gutterBottom>
          Sign Up
        </Typography>
        <SignUp routing="hash" />
      </Container>
    </Box>
  );
}