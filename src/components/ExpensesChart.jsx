import React, { useState, useEffect } from 'react';
import { LineChart, lineElementClasses, markElementClasses } from '@mui/x-charts/LineChart';
import { getTransactions } from '../api/transactionApi';
import { Box, Typography, ToggleButtonGroup, ToggleButton, CircularProgress } from '@mui/material';
import dayjs from 'dayjs';
// תרשים הוצאות לאורך זמן   
const ExpensesChart = () => {
    // מצבים ומשתנים של התרשים
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeFrame, setTimeFrame] = useState('month');
    const [chartData, setChartData] = useState({
        xLabels: [],
        amounts: []
    });
    // שימוש ב-useEffect לטעינת הנתונים מהשרת   
    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                setLoading(true);
                const data = await getTransactions();
                setTransactions(data);
                setLoading(false);
            } catch (err) {
                setError('שגיאה בטעינת נתוני העסקאות');
                setLoading(false);
                console.error('Error fetching transactions:', err);
            }
        };

        fetchTransactions();
    }, []);

    useEffect(() => {
        if (transactions.length > 0) {
            prepareChartData();
        }
    }, [transactions, timeFrame]);
    // פונקציה להכנת נתונים לתרשים  
    const prepareChartData = () => {
        // עיבוד הנתונים לפי מסגרת הזמן שנבחרה
        const expenseTransactions = transactions.filter(t => t.type === 'expense');

        let xLabels = [];// מערך לשמירת התווים בציר ה-X
        let amounts = [];// מערך לשמירת הסכומים בציר ה-Y    
        // עיבוד לפי מסגרת הזמן שנבחרה  
        if (timeFrame === 'day') {
            // קבץ לפי שעות של היום
            const today = dayjs().startOf('day');

            // יצירת מערך של שעות היום
            for (let hour = 0; hour < 24; hour++) {
                const hourTransactions = expenseTransactions.filter(t => {
                    const transDate = dayjs(t.date);
                    return transDate.isAfter(today) &&
                        transDate.hour() === hour;
                });
                // חישוב סכום הוצאות לפי שעה
                const hourTotal = hourTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
                // הוספת התווים והסכומים למערכים המתאימים   
                xLabels.push(`${hour}:00`);
                amounts.push(hourTotal);
            }
        } else if (timeFrame === 'week') {
            // קבץ לפי ימי השבוע
            const daysOfWeek = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
            // חישוב סכום הוצאות לפי יום
            for (let i = 0; i < 7; i++) {
                const day = dayjs().subtract(6 - i, 'day');
                const dayStart = day.startOf('day');
                const dayEnd = day.endOf('day');
                // מסגרת זמן לפי יום
                const dayTransactions = expenseTransactions.filter(t => {
                    const transDate = dayjs(t.date);
                    return transDate.isAfter(dayStart) &&
                        transDate.isBefore(dayEnd);
                });
                // חישוב סכום הוצאות לפי יום
                const dayTotal = dayTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
                // הוספת התווים והסכומים למערכים המתאימים   
                xLabels.push(daysOfWeek[day.day()]);
                amounts.push(dayTotal);
            }
        } else if (timeFrame === 'month') {
            // קבץ לפי שבועות בחודש

            // חלוקה ל-4 שבועות אחורה
            for (let i = 0; i < 4; i++) {
                const weekStart = dayjs().subtract(21 - i * 7, 'day');
                const weekEnd = dayjs(weekStart).add(6, 'day');
                // מסגרת זמן לפי שבוע
                const weekTransactions = expenseTransactions.filter(t => {
                    const transDate = dayjs(t.date);
                    return transDate.isAfter(weekStart) &&
                        transDate.isBefore(weekEnd);
                });
                // חישוב סכום הוצאות לפי שבוע
                const weekTotal = weekTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
                // הוספת התווים והסכומים למערכים המתאימים           
                xLabels.push(`שבוע ${i + 1}`);
                amounts.push(weekTotal);
            }
        } else if (timeFrame === 'year') {
            // קבץ לפי חודשי השנה האחרונה
            const monthNames = [
                'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
                'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
            ];
            // חישוב סכום הוצאות לפי חודש
            for (let i = 11; i >= 0; i--) {
                const month = dayjs().subtract(i, 'month');
                const monthStart = month.startOf('month');
                const monthEnd = month.endOf('month');
                // מסגרת זמן לפי חודש
                const monthTransactions = expenseTransactions.filter(t => {
                    const transDate = dayjs(t.date);
                    return transDate.isAfter(monthStart) &&
                        transDate.isBefore(monthEnd);
                });
                // חישוב סכום הוצאות לפי חודש
                const monthTotal = monthTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
                // הוספת התווים והסכומים למערכים המתאימים               
                xLabels.push(`${monthNames[month.month()]}`);
                amounts.push(monthTotal);
            }
        }
        // הגדרת הנתונים לתרשים     
        setChartData({
            xLabels,
            amounts
        });
    };
    // פונקציה לשינוי מסגרת הזמן
    const handleTimeFrameChange = (event, newTimeFrame) => {
        if (newTimeFrame !== null) {
            setTimeFrame(newTimeFrame);
        }
    };
    // טעינת תרשים במצב טעינה
    if (loading) {
        return <CircularProgress />;
    }
    // טעינת תרשים במצב שגיאה
    if (error) {
        return <Typography color="error">{error}</Typography>;
    }
    // טעינת תרשים במצב מצב טופס    
    return (
        <Box sx={{
            width: '100%',
            height: 400,
            bgcolor: 'transparent'
        }}>
            <Box sx={{
                mb: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Typography
                    variant="h6"
                    component="div"
                    sx={{ color: '#658285', fontWeight: 'bold' }}
                >
                    תרשים הוצאות לאורך זמן
                </Typography>
                <ToggleButtonGroup
                    value={timeFrame}
                    exclusive
                    onChange={handleTimeFrameChange}
                    aria-label="time frame"
                    size="small"
                >
                    <ToggleButton value="day" aria-label="day">
                        יום
                    </ToggleButton>
                    <ToggleButton value="week" aria-label="week">
                        שבוע
                    </ToggleButton>
                    <ToggleButton value="month" aria-label="month">
                        חודש
                    </ToggleButton>
                    <ToggleButton value="year" aria-label="year">
                        שנה
                    </ToggleButton>
                </ToggleButtonGroup>
                {/* תיק תיק טופס וכותרת וכפתורים לשינוי מסגרת הזמן */}
            </Box>
            <Box sx={{
                height: 300,
                width: '100%',
                display: 'flex',
                justifyContent: 'center'
            }}>
                <LineChart
                    series={[
                        {
                            data: chartData.amounts,
                            label: '',
                            color: '#f44336',
                            id: 'expenseId',
                            showMark: true,
                        }
                    ]}
                    xAxis={[{
                        data: chartData.xLabels,
                        scaleType: 'point',
                        tickLabelStyle: {
                            angle: 0,
                            textAnchor: 'middle',
                            fontSize: 12,
                            fill: '#658285',
                        },
                    }]}
                    yAxis={[{
                        label: 'סכום (₪)',
                        labelStyle: {
                            fill: '#658285',
                        },
                        tickLabelStyle: {
                            fill: '#658285',
                        },
                    }]}
                    sx={{
                        [`.${lineElementClasses.root}, .${markElementClasses.root}`]: {
                            strokeWidth: 2,
                        },
                        '.MuiLineElement-series-expenseId': {
                            strokeDasharray: '5 5',
                        },
                        [`.${markElementClasses.root}:not(.${markElementClasses.highlighted})`]: {
                            fill: '#fff',
                            stroke: '#f44336',
                        },
                        [`& .${markElementClasses.highlighted}`]: {
                            stroke: '#f44336',
                            fill: '#f44336',
                        },
                        '& .MuiChartsGrid-root': {
                            display: 'none',
                        },
                    }}
                    margin={{
                        left: 60,
                        right: 20,
                        top: 20,
                        bottom: 30,
                    }}
                    disableAxisListener={true}
                    legend={{ hidden: true }}
                />
            </Box>
        </Box>
    );
};
// ייצוא תרשים הוצאות לאורך זמן כפונקציה    
export default ExpensesChart; 