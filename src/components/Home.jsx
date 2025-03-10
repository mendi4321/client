import React from 'react';
import { Box, Typography, Paper, Container, Grid } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import { NavLink } from 'react-router-dom';

// מסך הבית
export default function Home() {
    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 4 }}>
                {/* כותרת ראשית */}
                <Typography
                    variant="h4"
                    align="center"
                    sx={{
                        mb: 4,
                        color: '#658285',
                        fontWeight: 'bold',
                        marginTop: '0px',
                    }}
                >
                    ברוכים הבאים לניהול המשק בית שלכם
                </Typography>
                <Typography
                    variant="h2"
                    align="center"
                    sx={{
                        mb: 4,
                        color: '#658285',
                        fontWeight: 'bold',
                        marginTop: '0px',
                    }}
                >
                    בית בשליטה!
                </Typography>
                {/* קופסאות מידע */}
                <Grid container spacing={4} sx={{ mt: 2 }}>
                    {/* קופסת הכנסות/הוצאות */}
                    <Grid item xs={12} md={6}>
                        <Paper
                            elevation={3}
                            sx={{
                                p: 3,
                                textAlign: 'center',
                                height: '100%',
                                backgroundColor: '#e8f5e9',
                                marginTop: '0px',
                                '&:hover': {
                                    backgroundColor: '#c8e6c9',
                                    cursor: 'pointer'
                                }
                            }}
                        >
                            {/* כפתור שמפנה למסך ההוצאות והכנסות */}
                            <AccountBalanceWalletIcon sx={{ fontSize: 60, color: '#4caf50', mb: 2 }} />
                            <NavLink to="/income-expenses" style={{ textDecoration: 'none' }}>
                                <Typography variant="h4" sx={{ mb: 2, color: '#2e7d32' }}>
                                    ניהול הכנסות והוצאות!
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#1b5e20' }}>
                                    נהלו את התקציב שלכם בקלות עם מעקב אחר הכנסות והוצאות
                                </Typography>
                            </NavLink>
                        </Paper>
                    </Grid>

                    {/* קופסת טיפים */}
                    <Grid item xs={12} md={6}>
                        <Paper
                            elevation={3}
                            sx={{
                                p: 3,
                                textAlign: 'center',
                                height: '100%',
                                backgroundColor: '#e3f2fd',
                                '&:hover': {
                                    backgroundColor: '#bbdefb',
                                    cursor: 'pointer'
                                }
                            }}
                        >
                            {/* כפתור שמפנה למסך הטיפים */}
                            <TipsAndUpdatesIcon sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
                            <NavLink to="/bank" style={{ textDecoration: 'none' }}>
                                <Typography variant="h4" sx={{ mb: 2, color: '#1565c0' }}>
                                    טיפים לחיסכון!
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#0d47a1' }}>
                                    גלו טיפים מועילים לחיסכון וניהול כספים נכון
                                </Typography>
                            </NavLink>
                        </Paper>
                    </Grid>
                </Grid>

                {/* מידע נוסף */}
                <Box sx={{ mt: 6, textAlign: 'center', marginTop: '75px' }}>
                    <Typography variant="h5" sx={{ mb: 2, color: '#658285' }}>
                        התחילו לנהל את הכספים שלכם בצורה חכמה!
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#658285' }}>
                        עם הכלים שלנו, תוכלו לעקוב אחר ההוצאות וההכנסות שלכם,
                        <br />
                        לקבל תובנות על דפוסי ההוצאות שלכם ולקבל טיפים לחיסכון.
                    </Typography>
                </Box>
            </Box>
        </Container >
    );
}