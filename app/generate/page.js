'use client'
import Image from 'next/image'
import { useUser } from "@clerk/nextjs"
import { AppBar, Container, Grid, Button, Box, Card, Toolbar, Typography, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Paper, CardActionArea, CardContent, ThemeProvider } from "@mui/material";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { collection, doc, writeBatch, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import dynamic from 'next/dynamic';


function Generate() {
    const { isLoaded, isSignedIn, user } = useUser();
    const [flashcards, setFlashcards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [text, setText] = useState("");
    const [name, setName] = useState("");
    const [open, setOpen] = useState(false);
    const [limitReached, setLimitReached] = useState(false);
    const [generationCount, setGenerationCount] = useState(0);
    const router = useRouter();

   

  
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedCount = parseInt(localStorage.getItem('generationCount') || '0');
            setGenerationCount(storedCount);
        }
    }, []);
    

   
    // Function to handle form submission for generating flashcards
const handleSubmit = async () => {
    if (generationCount >= 100) {
        setLimitReached(true); // Show the popup if limit reached
        return;
    }

    fetch('api/generate',{
        method:'POST',
        body: text,
    })
    .then((res)=>res.json())
    .then((data) => setFlashcards(data))
}

    // Function to handle the click event on a flashcard
    const handleCardClick = (id) => {
        setFlipped((prev) => ({
            ...prev,
            [id]: !prev[id]
        }));
    }

    const handleOpen = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const handleRedirectToSubscription = () => {
        router.push('./');
    };

    const handleSubscriptionClose = () => {
        setLimitReached(false); // Close the subscription popup
    };

    // Function to save the flashcards to the database
    const saveFlashcards = async () => {
        if (!name) {
            alert("Please enter a name for the flashcards");
            return;
        }

        if (!isSignedIn) {
            alert("You must be signed in to save flashcards");
            return;
        }

        const savedCount = parseInt(localStorage.getItem('savedCount') || '0');

        if (savedCount >= 3) {
            setLimitReached(true); // Show subscription popup if limit reached
            return;
        }


        // Helper function to capitalize the first letter of each word
        const toTitleCase = (str) => {
            return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
        };


        // Convert the flashcards name to uppercase
        const upperCaseName = toTitleCase(name);
        // Create a batch to write multiple documents in a single request
        const batch = writeBatch(db);
        const userDocRef = doc(collection(db, 'users'), user.id);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
            const collections = docSnap.data().flashcards || [];
            if (collections.find((f) => f.name === upperCaseName)) {
                alert("You already have a set of flashcards with that name");
                return;
            } else {
                collections.push({ name: upperCaseName });
                batch.set(userDocRef, { flashcards: collections }, { merge: true });
            }
        } else {
            batch.set(userDocRef, { flashcards: [{ name: upperCaseName }] });
        }

        const colref = collection(userDocRef, upperCaseName);
        flashcards.forEach((flashcard) => {
            const cardDocRef = doc(colref);
            batch.set(cardDocRef, flashcard);
        });
        await batch.commit();
        handleClose();
        localStorage.setItem('savedCount', (savedCount + 1).toString());
        router.push('./flashcards');
    }


    // Home button
    const handleHome = () => {
        router.push('./');
    };

    // Collections button
    const handleCollections = () => {
        if (!isSignedIn) {
            alert('You must be signed in to access the collection of flashcards.');
            return;
        }
        router.push('./flashcards');
    };

    const featuresRef = useRef(null);



    return (

        <Container maxWidth='md' sx={{ pt: 8 }}>
            <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'White' }}>
                <AppBar position="fixed" sx={{ backgroundColor: '#008B8B', width: '100%', zIndex: 2 }}>
                    <Toolbar>
                        <Typography variant="h6" sx={{ flexGrow: 1, fontFamily: 'Monospace' }}>
                            Flashcards For Fun
                        </Typography>
                        <Button color='inherit' spacing='20px' onClick={handleHome}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white', fontSize: '1rem', fontFamily: 'Monospace' }}>
                                Home
                            </Typography>
                        </Button>
                        <Button color='inherit' onClick={handleCollections}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white', fontSize: '1rem', fontFamily: 'Monospace' }}>
                                Collections
                            </Typography>
                        </Button>
                    </Toolbar>
                </AppBar>
                <Box sx={{
                    position: "absolute",
                    right: 0,
                    bottom: 0,
                    width: '50%',
                    height: '50%',
                    zIndex: 1, // Lower z-index for the background image
                    display: { xs: 'none', md: 'block' },
                }}>
                    
                </Box>

                <Container maxWidth='md' sx={{ pt: 8, zIndex: 1, position: 'relative' }}>
                    <Box
                        sx={{
                            mt: 4,
                            mb: 6,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                        <Typography variant="h3" fontWeight='bold' sx={{ zIndex: 3, fontFamily: 'Monospace' }}>Generate Flashcards</Typography>
                        <Paper color='black' sx={{ p: 4, width: '100%', mt: 6, zIndex: 3 }}>
                            <TextField
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                multiline
                                rows={4}
                                fullWidth
                                variant="outlined"
                                sx={{ mb: '4', fontFamily: 'Monospace' }}
                                label="Paste text here"
                            />
                            <Button sx={{ mt: 2, zIndex: 3, fontFamily: 'Monospace' }} fullWidth variant="contained" color="primary" onClick={handleSubmit}>Generate</Button>
                        </Paper>
                    </Box>

                    {flashcards.length > 0 && (
                        <Box sx={{ mt: 4 }}>
                            <Typography variant="h5" align="center" fontWeight={'bold'} sx={{ p: 5, fontFamily: 'Monospace' }}>Flashcards Preview</Typography>
                            <Grid container spacing={3} maxHeight={'100%'} maxWidth={'100%'}>
                                {flashcards.map((flashcard, id) => (
                                    <Grid item xs={12} sm={6} md={4} key={id}>
                                        <Card>
                                            <CardActionArea
                                                onClick={() => { handleCardClick(id) }}>
                                                <CardContent>
                                                    <Box
                                                        sx={{
                                                            perspective: '1000px',
                                                            '& > div': {
                                                                transition: 'transform 0.6s',
                                                                transformStyle: 'preserve-3d',
                                                                transform: flipped[id] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                                                position: 'relative',
                                                                width: '100%',
                                                                height: '200px',
                                                                boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
                                                                borderRadius: '8px',
                                                                display: 'flex',
                                                                flexDirection: 'column', // Ensures content flows from top to bottom
                                                            },
                                                            '& > div > div': {
                                                                backfaceVisibility: 'hidden',
                                                                position: 'absolute',
                                                                height: '100%',
                                                                width: '100%',
                                                                boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
                                                                borderRadius: '8px',
                                                                display: 'flex',
                                                                flexDirection: 'column', // Ensures content flows from top to bottom
                                                                alignItems: 'flex-start', // Aligns content to the top
                                                                justifyContent: 'flex-start', // Aligns content to the top
                                                                padding: 2,
                                                                boxSizing: 'border-box',
                                                                overflowY: 'auto', // Ensures scrollability for lengthy content
                                                            },
                                                            '& > div > div:nth-child(2)': {
                                                                transform: 'rotateY(180deg)',
                                                                backgroundColor: '#f5f5f5',
                                                                color: 'black',
                                                                fontSize: '0.9rem',
                                                                overflowY: 'auto', // Keeps scrolling on the back side
                                                                fontFamily: 'Monospace'
                                                            },
                                                        }}>
                                                        <div>
                                                            <div>
                                                                <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold', textAlign: 'center', marginBottom: '8px', fontFamily: 'Monospace' }}>
                                                                    {flashcard.topic}
                                                                </Typography>
                                                                <Typography variant="h6" component='div' fontFamily={"Monospace"}>
                                                                    {flashcard.front}
                                                                </Typography>
                                                            </div>
                                                            <div>
                                                                <Typography variant="body1" component='div' fontFamily={"Monospace"}>
                                                                    {flashcard.back}
                                                                </Typography>
                                                            </div>
                                                        </div>


                                                    </Box>
                                                </CardContent>
                                            </CardActionArea>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', mb: 4, border: '3', fontFamily: 'Monospace', fontWeight: 'bold' }}>
                                <Button variant="contained" color="primary" onClick={handleOpen} sx={{ fontFamily: 'Monospace', fontWeight: 'bold' }}>
                                    Save
                                </Button>
                            </Box>
                        </Box>
                    )}
                    <Dialog open={limitReached} onClose={handleSubscriptionClose}>
                        <DialogTitle>Subscription Required</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                You have reached the limit for flashcard generations. Please subscribe to continue generating and saving flashcards.
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleSubscriptionClose} color='primary'>Close</Button>
                            <Button variant='contained' onClick={handleRedirectToSubscription} color="primary">Subscribe</Button>
                        </DialogActions>
                    </Dialog>

                    <Dialog open={open} onClose={handleClose}>
                        <DialogTitle>Save Flashcards</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Enter a name to save your flashcards.
                            </DialogContentText>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Flashcard Name"
                                type="text"
                                fullWidth
                                variant="standard"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose}>Cancel</Button>
                            <Button onClick={saveFlashcards}>Save</Button>
                        </DialogActions>
                    </Dialog>
                </Container>
            </Box>
        </Container>

    )
}

// Export the dynamically imported component
export default Generate;