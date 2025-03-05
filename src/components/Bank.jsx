import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Box,
    CircularProgress,
    TextField,
    InputAdornment,
    Pagination,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Grid,
    Card,
    CardContent,
    Tab,
    Tabs,
    useTheme,
    useMediaQuery,
    CardHeader,
    Avatar,
    Chip,
    LinearProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import StarIcon from '@mui/icons-material/Star';
import MapIcon from '@mui/icons-material/Map';
import { styled } from '@mui/material/styles';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

// יצירת מטמון עבור RTL
const cacheRtl = createCache({
    key: 'muirtl',
    stylisPlugins: [prefixer, rtlPlugin],
});

// ערכת נושא מותאמת עם RTL
const rtlTheme = createTheme({
    palette: {
        primary: {
            main: '#1e4b8c', // כחול כהה בנקאי
            light: '#4273b9',
            dark: '#0d2c5a',
        },
        secondary: {
            main: '#e63946', // אדום לדגשים
            light: '#ff6b6b',
            dark: '#b02a37',
        },
        background: {
            default: '#f5f7fa',
            paper: '#fffff',
        },
        text: {
            primary: '#2c3e50',
            secondary: '#546e7a',
        },
    },
    typography: {
        fontFamily: '"Heebo", "Roboto", "Arial", sans-serif',
        h1: {
            fontWeight: 700,
        },
        h2: {
            fontWeight: 700,
        },
        h3: {
            fontWeight: 600,
        },
        h4: {
            fontWeight: 600,
        },
        h5: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 600,
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: '10px 16px',
                    textTransform: 'none',
                    fontWeight: 600,
                },
                containedPrimary: {
                    boxShadow: '0 4px 10px rgba(30, 75, 140, 0.2)',
                    '&:hover': {
                        boxShadow: '0 6px 12px rgba(30, 75, 140, 0.3)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.07)',
                    overflow: 'hidden',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                },
            },
        },
    },
});

// כרטיס מעוצב
const StyledCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s, box-shadow 0.2s',
    backgroundColor: '#eadec1',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#e9d0ab',

    }
}));

// כותרת סעיף מעוצבת
const SectionTitle = styled(Typography)(({ theme }) => ({
    position: 'relative',
    paddingBottom: '12px',
    marginBottom: '24px',
    fontWeight: 700,
    '&:after': {
        content: '""',
        position: 'absolute',
        width: '60px',
        height: '4px',
        bottom: 0,
        left: 0,
        backgroundColor: theme.palette.primary.main,
        borderRadius: '2px',
    }
}));

// נתוני השוואה מפורטים בין בנקים
const bankComparisonData = [
    {
        bank: 'בנק הפועלים',
        logo: 'https://upload.wikimedia.org/wikipedia/he/thumb/3/35/Bank_hapoalim_logo.svg/250px-Bank_hapoalim_logo.svg.png',
        checking: { rate: '0.1%', fee: '₪22 - ₪28' },
        savings: { shortTerm: '0.8% - 1.5%', longTerm: '1.7% - 2.5%' },
        mortgage: { fixed: '2.5% - 3.2%', adjustable: '1.9% - 3.0%', prime: 'פריים + 0.5% - 1.2%' },
        loans: { personal: '5.5% - 9.5%', business: '4.2% - 7.8%' },
        creditCard: { annualFee: '₪15 - ₪30 לחודש', benefits: 'הנחות ברשתות מזון וחנויות' },
        digitalServices: { app: 5, website: 4.5, features: 'העברות מהירות, בנק פתוח, ניהול תקציב' },
        customerService: { rating: 4.0, branches: 95, availability: 'א-ה 8:00-19:00, ו 8:00-13:00' },
        specialOffers: ['פטור מעמלות למצטרפים חדשים למשך 3 חודשים', 'הנחה בריבית למשכנתא לזוגות צעירים'],
        score: 4.2
    },
    {
        bank: 'בנק לאומי',
        logo: 'https://upload.wikimedia.org/wikipedia/he/thumb/b/b0/Leumi-logo.svg/200px-Leumi-logo.svg.png',
        checking: { rate: '0.05%', fee: '₪19 - ₪25' },
        savings: { shortTerm: '0.7% - 1.4%', longTerm: '1.6% - 2.4%' },
        mortgage: { fixed: '2.4% - 3.1%', adjustable: '1.8% - 2.9%', prime: 'פריים + 0.4% - 1.1%' },
        loans: { personal: '5.4% - 8.9%', business: '4.0% - 7.5%' },
        creditCard: { annualFee: '₪12 - ₪28 לחודש', benefits: 'כרטיס נטען לילדים, הטבות לנוער' },
        digitalServices: { app: 4.8, website: 4.7, features: 'חסכון אוטומטי, הלוואות דיגיטליות' },
        customerService: { rating: 4.1, branches: 103, availability: 'א-ה 8:30-18:30, ו 8:30-13:00' },
        specialOffers: ['ריבית מועדפת לחוסכים מעל 50,000 ₪', 'פטור מעמלות לסטודנטים'],
        score: 4.3
    },
    {
        bank: 'בנק דיסקונט',
        logo: 'https://upload.wikimedia.org/wikipedia/he/thumb/2/29/Discount_logo.svg/200px-Discount_logo.svg.png',
        checking: { rate: '0.05%', fee: '₪18 - ₪24' },
        savings: { shortTerm: '0.7% - 1.4%', longTerm: '1.5% - 2.3%' },
        mortgage: { fixed: '2.5% - 3.2%', adjustable: '1.9% - 3.0%', prime: 'פריים + 0.5% - 1.2%' },
        loans: { personal: '5.5% - 9.3%', business: '4.3% - 7.9%' },
        creditCard: { annualFee: '₪14 - ₪27 לחודש', benefits: 'צבירת נקודות במסעדות ובתי קפה' },
        digitalServices: { app: 4.5, website: 4.2, features: 'תשלום בקיו, הזמנת פנקסי שיקים' },
        customerService: { rating: 3.9, branches: 94, availability: 'א-ה 9:00-17:00, ו 9:00-12:30' },
        specialOffers: ['הטבות לחיילים משוחררים', 'מסלול חשבון בהתאמה אישית'],
        score: 4.0
    },
    {
        bank: 'בנק מזרחי טפחות',
        logo: 'https://upload.wikimedia.org/wikipedia/he/thumb/8/86/Mizrahi_Tefahot_logo.svg/250px-Mizrahi_Tefahot_logo.svg.png',
        checking: { rate: '0.15%', fee: '₪20 - ₪26' },
        savings: { shortTerm: '0.9% - 1.6%', longTerm: '1.8% - 2.6%' },
        mortgage: { fixed: '2.3% - 3.0%', adjustable: '1.7% - 2.8%', prime: 'פריים + 0.3% - 1.0%' },
        loans: { personal: '5.6% - 9.2%', business: '4.3% - 7.7%' },
        creditCard: { annualFee: '₪15 - ₪28 לחודש', benefits: 'הנחות בתדלוק ומסעדות' },
        digitalServices: { app: 4.3, website: 4.4, features: 'התראות בזמן אמת, עיצוב אישי' },
        customerService: { rating: 4.4, branches: 148, availability: 'א-ה 8:00-20:00, ו 8:00-13:30' },
        specialOffers: ['ייעוץ משכנתא פרסונלי', 'תכנית חיסכון ייעודית לילדים'],
        score: 4.4
    },
    {
        bank: 'הבנק הבינלאומי',
        logo: 'https://upload.wikimedia.org/wikipedia/he/d/d9/First_International_Bank.png',
        checking: { rate: '0.1%', fee: '₪19 - ₪24' },
        savings: { shortTerm: '0.75% - 1.3%', longTerm: '1.6% - 2.2%' },
        mortgage: { fixed: '2.6% - 3.3%', adjustable: '2.0% - 3.1%', prime: 'פריים + 0.6% - 1.3%' },
        loans: { personal: '5.7% - 9.0%', business: '4.5% - 8.0%' },
        creditCard: { annualFee: '₪14 - ₪26 לחודש', benefits: 'הטבות לנסיעות לחו"ל וביטוח' },
        digitalServices: { app: 4.2, website: 4.0, features: 'תשלום מהיר, תקציב אישי' },
        customerService: { rating: 3.8, branches: 72, availability: 'א-ה 8:30-18:00, ו 8:30-12:30' },
        specialOffers: ['פטור מעמלות לחשבון דיגיטלי', 'הנחות בעמלות מט"ח'],
        score: 3.9
    },
    {
        bank: 'בנק ירושלים',
        logo: 'https://upload.wikimedia.org/wikipedia/he/thumb/f/f0/Bank_Jerusalem_logo.svg/250px-Bank_Jerusalem_logo.svg.png',
        checking: { rate: '0.08%', fee: '₪15 - ₪22' },
        savings: { shortTerm: '0.8% - 1.4%', longTerm: '1.7% - 2.3%' },
        mortgage: { fixed: '2.7% - 3.4%', adjustable: '2.1% - 3.2%', prime: 'פריים + 0.7% - 1.4%' },
        loans: { personal: '5.9% - 9.5%', business: '4.7% - 8.2%' },
        creditCard: { annualFee: '₪10 - ₪22 לחודש', benefits: 'הנחות בחנויות אלקטרוניקה' },
        digitalServices: { app: 3.8, website: 3.7, features: 'צפייה בחשבון, העברות בסיסיות' },
        customerService: { rating: 3.5, branches: 18, availability: 'א-ה 9:00-17:00, ו 9:00-12:00' },
        specialOffers: ['פיקדונות בריבית גבוהה', 'מסלול השקעות מותאם אישית'],
        score: 3.7
    }
];

// שערי מטבע לדוגמה
const exchangeRates = [
    { name: 'דולר ארה"ב', code: 'USD', rate: 3.67, change: '+0.2%' },
    { name: 'אירו', code: 'EUR', rate: 3.94, change: '-0.1%' },
    { name: 'ליש"ט', code: 'GBP', rate: 4.62, change: '+0.15%' },
    { name: 'דולר קנדי', code: 'CAD', rate: 2.70, change: '-0.05%' },
];

function Bank() {
    const [branchData, setBranchData] = useState([]);
    const [filteredBranchData, setFilteredBranchData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [selectedBank, setSelectedBank] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [uniqueBanks, setUniqueBanks] = useState([]);
    const [uniqueCities, setUniqueCities] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const itemsPerPage = 15;
    const [tabValue, setTabValue] = useState(0);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // פונקציה לטעינת נתוני הסניפים
    const fetchAllBranchData = async () => {
        try {
            setLoading(true);
            const countResponse = await fetch(
                'https://data.gov.il/api/3/action/datastore_search?resource_id=1c5bc716-8210-4ec7-85be-92e6271955c2&limit=0'
            );
            const countData = await countResponse.json();
            const total = countData.result.total;
            setTotalRecords(total);

            let allRecords = [];
            const batchSize = 1000;
            const batches = Math.ceil(Math.min(total, 5000) / batchSize);

            for (let i = 0; i < batches; i++) {
                const response = await fetch(
                    `https://data.gov.il/api/3/action/datastore_search?resource_id=1c5bc716-8210-4ec7-85be-92e6271955c2&limit=${batchSize}&offset=${i * batchSize}`
                );

                if (!response.ok) {
                    throw new Error(`בעיה בטעינת נתוני הסניפים (קבוצה ${i + 1})`);
                }

                const data = await response.json();
                if (data.success && data.result && data.result.records) {
                    allRecords = [...allRecords, ...data.result.records];
                }
            }

            setBranchData(allRecords);
            setFilteredBranchData(allRecords);

            const banks = [...new Set(allRecords.map(branch => branch.Bank_Name).filter(Boolean))].sort();
            const cities = [...new Set(allRecords.map(branch => branch.City).filter(Boolean))].sort();

            setUniqueBanks(banks);
            setUniqueCities(cities);

        } catch (err) {
            console.error('שגיאה בטעינת נתוני הבנקים:', err);
        } finally {
            setLoading(false);
        }
    };

    // טעינה ראשונית של הנתונים
    useEffect(() => {
        fetchAllBranchData();
    }, []);

    // טיפול בשינוי טאב
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        // טופס חיפוש מטבע  
        <CacheProvider value={cacheRtl}>
            <ThemeProvider theme={rtlTheme}>
                <Box sx={{ minHeight: '100vh', pb: 8, marginTop: '0px', backgroundColor: '#fff9eb' }}>

                    <Container>
                        {/* טאבים לניווט */}
                        <Paper sx={{
                            mb: 4,
                            borderRadius: '0 0 12px 12px',
                            overflow: 'hidden',
                            backgroundColor: '#658285',
                            boxShadow: 'none'
                        }}>
                            <Tabs
                                value={tabValue}
                                onChange={handleTabChange}
                                variant={isMobile ? "scrollable" : "fullWidth"}
                                scrollButtons="auto"
                                textColor="primary"
                                indicatorColor="primary"
                                aria-label="תפריט נושאים בנקאיים"
                            >
                                <Tab sx={{ color: '#e9d0ab' }} icon={<AccountBalanceIcon />} label="השוואת בנקים" />
                                <Tab sx={{ color: '#e9d0ab' }} icon={<MapIcon />} label="איתור סניפים" />
                            </Tabs>
                        </Paper>

                        {/* תוכן הטאבים */}
                        <div role="tabpanel" hidden={tabValue !== 0}>
                            {tabValue === 0 && (
                                <>
                                    {/* שערי מטבע */}
                                    <Box sx={{ mb: 5 }}>
                                        <SectionTitle variant="h5" component="h2">
                                            שערי מטבע עדכניים
                                        </SectionTitle>
                                        <Grid container spacing={2}>
                                            {exchangeRates.map((currency, index) => (
                                                <Grid item xs={6} sm={3} key={index}>
                                                    <StyledCard sx={{ backgroundColor: '#e9d0ab' }}>
                                                        <CardHeader
                                                            avatar={
                                                                <Avatar sx={{ bgcolor: 'primary.light', color: '#e9d0ab', backgroundColor: '#658285' }}>
                                                                    {currency.code.substring(0, 1)}
                                                                </Avatar>
                                                            }
                                                            title={currency.name}
                                                            subheader={currency.code}
                                                        />
                                                        <CardContent>
                                                            <Typography variant="h5" component="div" gutterBottom>
                                                                ₪{currency.rate.toFixed(2)}
                                                            </Typography>
                                                            <Chip
                                                                label={currency.change}
                                                                size="small"
                                                                color={currency.change.startsWith('+') ? "success" : "error"}
                                                            />
                                                        </CardContent>
                                                    </StyledCard>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>

                                    {/* השוואת בנקים */}
                                    <Box sx={{ mb: 5 }}>
                                        <SectionTitle variant="h5" component="h2">
                                            השוואה מקיפה בין בנקים בישראל
                                        </SectionTitle>
                                        <Typography variant="body2" sx={{ mb: 3 }}>
                                            טבלה זו מציגה השוואה מקיפה בין הבנקים המובילים בישראל. הנתונים מתעדכנים מדי חודש.
                                        </Typography>

                                        <TableContainer component={Paper}
                                            sx={{
                                                mb: 4, overflow: 'auto',
                                                boxShadow: '0 6px 20px #658285',
                                                backgroundColor: '#e9d0ab',
                                                '& .MuiTableCell-root': {
                                                }
                                            }}>
                                            <Table aria-label="טבלת השוואת בנקים מפורטת">
                                                <TableHead>
                                                    <TableRow sx={{ backgroundColor: '#658285' }}>
                                                        <TableCell sx={{ color: '#e9d0ab' }}>בנק</TableCell>
                                                        <TableCell sx={{ color: '#e9d0ab' }}>חשבון עו"ש</TableCell>
                                                        <TableCell sx={{ color: '#e9d0ab' }}>חסכונות</TableCell>
                                                        <TableCell sx={{ color: '#e9d0ab' }}>משכנתאות</TableCell>
                                                        <TableCell sx={{ color: '#e9d0ab' }}>הלוואות</TableCell>
                                                        <TableCell sx={{ color: '#e9d0ab' }}>כרטיסי אשראי</TableCell>
                                                        <TableCell sx={{ color: '#e9d0ab' }}>שירותים דיגיטליים</TableCell>
                                                        <TableCell sx={{ color: '#e9d0ab' }}>שירות לקוחות</TableCell>
                                                        <TableCell sx={{ color: '#e9d0ab' }}>דירוג כללי</TableCell>
                                                        <TableCell sx={{ color: '#e9d0ab' }}>ציון כללי</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {bankComparisonData.map((bank, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>
                                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                                        {bank.bank}
                                                                    </Typography>
                                                                    <Avatar sx={{
                                                                        width: 40,
                                                                        height: 40,
                                                                        bgcolor: 'primary.main',
                                                                        color: '#fff9eb',
                                                                        backgroundColor: '#658285'
                                                                    }}>
                                                                        {bank.bank.charAt(0)}
                                                                    </Avatar>
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="body2">
                                                                    <strong>ריבית:</strong> {bank.checking.rate}
                                                                </Typography>
                                                                <Typography variant="body2">
                                                                    <strong>עמלה:</strong> {bank.checking.fee}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="body2">
                                                                    <strong>קצר טווח:</strong> {bank.savings.shortTerm}
                                                                </Typography>
                                                                <Typography variant="body2">
                                                                    <strong>ארוך טווח:</strong> {bank.savings.longTerm}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="body2">
                                                                    <strong>ריבית קבועה:</strong> {bank.mortgage.fixed}
                                                                </Typography>
                                                                <Typography variant="body2">
                                                                    <strong>ריבית משתנה:</strong> {bank.mortgage.adjustable}
                                                                </Typography>
                                                                <Typography variant="body2">
                                                                    <strong>פריים:</strong> {bank.mortgage.prime}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="body2">
                                                                    <strong>אישי:</strong> {bank.loans.personal}
                                                                </Typography>
                                                                <Typography variant="body2">
                                                                    <strong>עסקי:</strong> {bank.loans.business}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="body2">
                                                                    <strong>דמי כרטיס:</strong> {bank.creditCard.annualFee}
                                                                </Typography>
                                                                <Typography variant="body2">
                                                                    <strong>הטבות:</strong> {bank.creditCard.benefits}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                    <Typography variant="body2" sx={{ mr: 1 }}>
                                                                        <strong>אפליקציה:</strong>
                                                                    </Typography>
                                                                    <Box sx={{ display: 'flex' }}>
                                                                        {[...Array(5)].map((_, i) => (
                                                                            <StarIcon
                                                                                key={i}
                                                                                sx={{
                                                                                    fontSize: '16px',
                                                                                    color: i < Math.floor(bank.digitalServices.app) ? '#658285' : '#fff9eb'
                                                                                }}
                                                                            />
                                                                        ))}
                                                                    </Box>
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                    <Typography variant="body2" sx={{ mr: 1 }}>
                                                                        <strong>אתר:</strong>
                                                                    </Typography>
                                                                    <Box sx={{ display: 'flex' }}>
                                                                        {[...Array(5)].map((_, i) => (
                                                                            <StarIcon
                                                                                key={i}
                                                                                sx={{
                                                                                    fontSize: '16px',
                                                                                    color: i < Math.floor(bank.digitalServices.website) ? '#658285' : '#fff9eb'
                                                                                }}
                                                                            />
                                                                        ))}
                                                                    </Box>
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                    <Typography variant="body2" sx={{ mr: 1 }}>
                                                                        <strong>דירוג:</strong>
                                                                    </Typography>
                                                                    <Box sx={{ display: 'flex' }}>
                                                                        {[...Array(5)].map((_, i) => (
                                                                            <StarIcon
                                                                                key={i}
                                                                                sx={{
                                                                                    fontSize: '16px',
                                                                                    color: i < Math.floor(bank.customerService.rating) ? '#658285' : '#fff9eb'
                                                                                }}
                                                                            />
                                                                        ))}
                                                                    </Box>
                                                                </Box>
                                                                <Typography variant="body2">
                                                                    <strong>סניפים:</strong> {bank.customerService.branches}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#658285', textAlign: 'center' }}>
                                                                    {bank.score}
                                                                </Typography>
                                                                <LinearProgress
                                                                    variant="determinate"
                                                                    value={(bank.score / 5) * 100}
                                                                    sx={{
                                                                        height: 8,
                                                                        borderRadius: 4,
                                                                        backgroundColor: '#fff9eb',
                                                                        '& .MuiLinearProgress-bar': {
                                                                            borderRadius: 4,
                                                                            backgroundColor: bank.score >= 4 ? '#658285' :
                                                                                bank.score >= 3 ? '#658285' : '#658285',
                                                                        }
                                                                    }}
                                                                />
                                                                <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 0.5 }}>
                                                                    מתוך 5
                                                                </Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Box>
                                </>
                            )}
                        </div>
                        {/* איתור סניפים */}
                        <div role="tabpanel" hidden={tabValue !== 1}>
                            {tabValue === 1 && (
                                <>
                                    <SectionTitle variant="h5" component="h2">
                                        איתור סניפי בנקים
                                    </SectionTitle>

                                    <Paper sx={{ p: 3, mb: 4, borderRadius: '12px', backgroundColor: '#e9d0ab' }}>
                                        <Grid container spacing={2} alignItems="center">
                                            <Grid item xs={12} md={4}>
                                                <FormControl fullWidth variant="outlined">
                                                    <InputLabel id="bank-select-label">בחר בנק</InputLabel>
                                                    <Select
                                                        labelId="bank-select-label"
                                                        value={selectedBank}
                                                        onChange={(e) => setSelectedBank(e.target.value)}
                                                        label="בחר בנק"
                                                    >
                                                        <MenuItem value="">כל הבנקים</MenuItem>
                                                        {uniqueBanks.map((bank, index) => (
                                                            <MenuItem key={index} value={bank}>{bank}</MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12} md={4}>
                                                <FormControl fullWidth variant="outlined">
                                                    <InputLabel id="city-select-label">בחר עיר</InputLabel>
                                                    <Select
                                                        labelId="city-select-label"
                                                        value={selectedCity}
                                                        onChange={(e) => setSelectedCity(e.target.value)}
                                                        label="בחר עיר"
                                                    >
                                                        <MenuItem value="">כל הערים</MenuItem>
                                                        {uniqueCities.map((city, index) => (
                                                            <MenuItem key={index} value={city}>{city}</MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12} md={4}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    placeholder="חיפוש לפי שם, רחוב, עיר..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <SearchIcon />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                            </Grid>
                                        </Grid>

                                        {/* כפתורי פעולה */}
                                        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                            <Button
                                                startIcon={<RefreshIcon />}
                                                onClick={() => {
                                                    setSelectedBank('');
                                                    setSelectedCity('');
                                                    setSearchTerm('');
                                                    setFilteredBranchData(branchData);
                                                    setPage(1);
                                                }}
                                                variant="outlined"
                                                sx={{ backgroundColor: '#658285', color: '#fff9eb' }}
                                            >
                                                נקה חיפוש
                                            </Button>
                                            <Button
                                                startIcon={<SearchIcon />}
                                                variant="contained"
                                                sx={{ backgroundColor: '#658285', color: '#fff9eb' }}
                                                onClick={() => {
                                                    const filtered = branchData.filter(branch => {
                                                        const bankMatch = !selectedBank || branch.Bank_Name === selectedBank;
                                                        const cityMatch = !selectedCity || branch.City === selectedCity;
                                                        const searchMatch = !searchTerm ||
                                                            branch.Bank_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                            branch.Branch_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                            branch.City?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                            branch.Street?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                            branch.Branch_Code?.toString().includes(searchTerm);

                                                        return bankMatch && cityMatch && searchMatch;
                                                    });

                                                    setFilteredBranchData(filtered);
                                                    setPage(1);
                                                }}
                                            >
                                                חפש סניפים
                                            </Button>
                                        </Box>
                                    </Paper>

                                    {/* תוצאות סניפים */}
                                    <Box sx={{ mb: 4 }}>
                                        {loading ? (
                                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                                <CircularProgress />
                                                <Typography variant="body1" sx={{ mt: 2 }}>
                                                    טוען רשימת סניפים...
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, color: '#658285' }}>
                                                    <Typography variant="subtitle1">
                                                        נמצאו {filteredBranchData.length} סניפים
                                                        {(selectedBank || selectedCity || searchTerm) ? ' (מסוננים)' : ''}
                                                    </Typography>

                                                    <Chip
                                                        label={`מציג סניפים ${page * itemsPerPage - itemsPerPage + 1} - ${Math.min(page * itemsPerPage, filteredBranchData.length)} מתוך ${filteredBranchData.length}`}
                                                        variant="outlined"
                                                        size="small"
                                                        color="primary"
                                                    />
                                                </Box>

                                                <Grid container spacing={2}>
                                                    {filteredBranchData.slice((page - 1) * itemsPerPage, page * itemsPerPage).map((branch, index) => (
                                                        <Grid item xs={12} sm={6} md={4} key={index}>
                                                            <StyledCard>
                                                                <CardHeader
                                                                    avatar={
                                                                        <Avatar sx={{ bgcolor: 'primary.main', color: '#fff9eb', backgroundColor: '#658285' }}>
                                                                            {branch.Bank_Name ? branch.Bank_Name.substring(0, 1) : 'B'}
                                                                        </Avatar>
                                                                    }
                                                                    title={branch.Bank_Name}
                                                                    subheader={`סניף ${branch.Branch_Name} (${branch.Branch_Code})`}
                                                                />
                                                                <CardContent>
                                                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                                                        <strong>כתובת:</strong> {branch.City}, {branch.Street} {branch.House_Number}
                                                                    </Typography>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        <strong>טלפון:</strong> {branch.Telephone || 'לא זמין'}
                                                                    </Typography>
                                                                    {branch.Handicap_Access && (
                                                                        <Chip
                                                                            size="small"
                                                                            label="גישה לנכים"
                                                                            color="success"
                                                                            sx={{ mt: 1, backgroundColor: '#658285', color: '#fff9eb' }}
                                                                        />
                                                                    )}
                                                                </CardContent>
                                                            </StyledCard>
                                                        </Grid>
                                                    ))}
                                                </Grid>

                                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                                    <Pagination
                                                        count={Math.ceil(filteredBranchData.length / itemsPerPage)}
                                                        page={page}
                                                        onChange={(e, newPage) => setPage(newPage)}
                                                        color="primary"
                                                        size="large"
                                                        showFirstButton
                                                        showLastButton
                                                    />
                                                </Box>
                                            </>
                                        )}
                                    </Box>
                                </>
                            )}
                        </div>

                    </Container>
                </Box>
            </ThemeProvider>
        </CacheProvider >
    );
}

export default Bank;