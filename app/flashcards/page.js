'use client';
import { SignOutButton, useUser, useClerk } from "@clerk/nextjs";
import { AppBar, Container, Toolbar, Button, Typography, Grid, Card, CardActionArea, CardContent, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, Box } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { collection, doc, writeBatch, getDoc, setDoc, deleteDoc, docs } from "firebase/firestore";
import { db } from "@/firebase";
import Image from 'next/image';
import RemoveCircleTwoToneIcon from '@mui/icons-material/RemoveCircleTwoTone';

export default function Flashcards() {
    const { isLoaded, isSignedIn, user } = useUser();
    const [flashcardCollections, setFlashcardCollections] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedCollection, setSelectedCollection] = useState(null);
    const router = useRouter();
    const clerk = useClerk();  // Access Clerk client

    useEffect(() => {
        async function getFlashcards() {
            if (!user) return;
            const userDocRef = doc(collection(db, 'users'), user.id);
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
                const collections = docSnap.data().flashcards || [];
                setFlashcardCollections(collections);
            } else {
                await setDoc(userDocRef, { flashcards: [] });
            }
        }
        getFlashcards();
    }, [user]);

    if (!isLoaded || !isSignedIn) {
        return <></>;
    }

    const handleCardClick = (id) => {
        router.push(`./flashcard?id=${id}`);
    };
    const handleback = () => {
        router.push(`./generate`);
    };
    const handleHome = () => {
        router.push(`./`);
    };

    const handleLogout = async () => {
        await clerk.signOut();  // Sign out using Clerk
        router.push('./');  // Redirect to sign-in page after logout
    };

    const handleOpenDialog = (collection) => {
        setSelectedCollection(collection);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedCollection(null);
    };

    const handleDeleteCollection = async () => {
        if (!user || !selectedCollection) return;

        const userDocRef = doc(collection(db, 'users'), user.id);

        try {
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
                const collections = docSnap.data().flashcards || [];
                const updatedCollections = collections.filter(collection => collection.name !== selectedCollection.name);
                await setDoc(userDocRef, { flashcards: updatedCollections });
                setFlashcardCollections(updatedCollections);
            }
        } catch (error) {
            console.error("Error deleting collection: ", error);
        }

        setOpenDialog(false);
        setSelectedCollection(null);
    };

    return (
        <Container maxWidth='lg' >
            <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'White', position: 'relative' }}>
                <AppBar position="fixed" sx={{ backgroundColor: '#008B8B', width: '100%', zIndex: 3 }}>
                    <Toolbar>
                        <Button sx={{ textTransform: 'none' }} onClick={handleHome}>
                            <Typography variant="h6" sx={{ flexGrow: 1, color: 'white', fontFamily: 'Monospace' }}>
                                Flashcards For Fun
                            </Typography>
                        </Button>
                        <Box sx={{ flexGrow: 1 }} /> {/* Spacer */}
                        <Box sx={{ display: 'flex', gap: '16px' }}> {/* Flex container for buttons */}
                            <Button color='inherit' onClick={handleback}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white', fontSize: '1rem', fontFamily: 'Monospace' }}>
                                    Back
                                </Typography>
                            </Button>
                            <Button color='inherit' onClick={handleLogout}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white', fontSize: '1rem', fontFamily: 'Monospace' }}>
                                    Logout
                                </Typography>
                            </Button>
                        </Box>
                    </Toolbar>
                </AppBar>
                <Box sx={{
                    position: "absolute",
                    left: 200,
                    top: 100,
                    width: '100%',
                    height: '100%',
                    zIndex: 1,
                    display: { xs: 'none', md: 'block' },
                    overflow: 'hidden' 
                }}>
                </Box>
                <Grid container spacing={3} sx={{ mt: 10, zIndex: 2 }}> {/* Adjust mt for spacing */}
                    {flashcardCollections.map((collection, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index} sx={{ position: 'relative' }}>
                            <Card>
                                <CardActionArea onClick={() => handleCardClick(collection.name)}>
                                    <CardContent>
                                        <Typography variant="h5" sx={{ textAlign: 'center' }}>{collection.name}</Typography>
                                    </CardContent>
                                </CardActionArea>
                                <IconButton
                                    sx={{ position: "absolute", top: 10, right: 10, color: 'red' }}
                                    onClick={() => handleOpenDialog(collection)}
                                >
                                    <RemoveCircleTwoToneIcon />
                                </IconButton>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Dialog
                    open={openDialog}
                    onClose={handleCloseDialog}
                >
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogContent>
                        <Typography sx={{ fontFamily: 'Monospace' }}>Are you sure you want to delete this collection?</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} color="primary" sx={{ fontFamily: 'Monospace' }}>Cancel</Button>
                        <Button onClick={handleDeleteCollection} color="secondary" sx={{ fontFamily: 'Monospace' }}>Delete</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Container>
    );
}