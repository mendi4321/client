import React, { useState, useEffect } from 'react';
import { LineChart, lineElementClasses, markElementClasses } from '@mui/x-charts/LineChart';
import { Box, Typography, CircularProgress } from '@mui/material';
import dayjs from 'dayjs';

// תרשים הוצאות לאורך זמן   
const ExpensesChart = ({ filteredTransactions, dateRange, selectedCurrency, getCurrencySymbol, convertedAmounts }) => {
    const [chartData, setChartData] = useState({
        xLabels: [],
        amounts: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // שימוש ב-useEffect להכנת נתונים לתרשים כאשר מתקבלים נתונים חדשים
    useEffect(() => {
        prepareChartData();
    }, [filteredTransactions, dateRange, selectedCurrency, convertedAmounts]);

    // פונקציה להכנת נתונים לתרשים  
    const prepareChartData = () => {
        let xLabels = []; // מערך לשמירת התווים בציר ה-X
        let amounts = []; // מערך לשמירת הסכומים בציר ה-Y  

        const now = dayjs();

        if (dateRange === 'day') {
            // הצגת נתונים לפי שעות ביום
            const hoursData = {};

            // אתחול מערך השעות מ-0 עד 23
            for (let hour = 0; hour < 24; hour++) {
                hoursData[hour] = 0;
                xLabels.push(`${hour}:00`);
            }

            // חישוב סכום הוצאות לפי שעה
            filteredTransactions.forEach(transaction => {
                const transactionDate = dayjs(transaction.date);
                const hour = transactionDate.hour();

                const amount = selectedCurrency === 'ILS'
                    ? Number(transaction.amount)
                    : convertedAmounts[transaction._id] || Number(transaction.amount);

                hoursData[hour] += amount;
            });

            // יצירת מערך הסכומים לפי סדר השעות
            amounts = Object.values(hoursData);

        } else if (dateRange === 'week') {
            // הצגת נתונים לפי ימי השבוע
            const daysOfWeek = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
            const daysData = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

            xLabels = [...daysOfWeek];

            // חישוב סכום הוצאות לפי יום בשבוע
            filteredTransactions.forEach(transaction => {
                const transactionDate = dayjs(transaction.date);
                const dayOfWeek = transactionDate.day(); // 0-6, כאשר 0 = ראשון

                const amount = selectedCurrency === 'ILS'
                    ? Number(transaction.amount)
                    : convertedAmounts[transaction._id] || Number(transaction.amount);

                daysData[dayOfWeek] += amount;
            });

            // יצירת מערך הסכומים לפי סדר הימים
            amounts = Object.values(daysData);

        } else if (dateRange === 'month') {
            // הצגת נתונים לפי שבועות בחודש
            xLabels = ['שבוע 1', 'שבוע 2', 'שבוע 3', 'שבוע 4', 'שבוע 5'];
            const weekData = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };

            // חישוב סכום הוצאות לפי שבוע בחודש
            filteredTransactions.forEach(transaction => {
                const transactionDate = dayjs(transaction.date);

                // חישוב מספר השבוע בחודש (0-4)
                const dayOfMonth = transactionDate.date(); // 1-31
                const weekOfMonth = Math.floor((dayOfMonth - 1) / 7);

                const amount = selectedCurrency === 'ILS'
                    ? Number(transaction.amount)
                    : convertedAmounts[transaction._id] || Number(transaction.amount);

                weekData[weekOfMonth] += amount;
            });

            // יצירת מערך הסכומים לפי סדר השבועות
            amounts = Object.values(weekData);

        } else if (dateRange === 'year') {
            // הצגת נתונים לפי חודשים בשנה
            const monthNames = [
                'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
                'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
            ];
            const monthData = {};

            // אתחול מערך החודשים
            for (let i = 0; i < 12; i++) {
                monthData[i] = 0;
                xLabels.push(monthNames[i]);
            }

            // חישוב סכום הוצאות לפי חודש
            filteredTransactions.forEach(transaction => {
                const transactionDate = dayjs(transaction.date);
                const month = transactionDate.month(); // 0-11

                const amount = selectedCurrency === 'ILS'
                    ? Number(transaction.amount)
                    : convertedAmounts[transaction._id] || Number(transaction.amount);

                monthData[month] += amount;
            });

            // יצירת מערך הסכומים לפי סדר החודשים
            amounts = Object.values(monthData);
        }

        setChartData({
            xLabels,
            amounts
        });
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
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Typography
                    variant="h6"
                    component="div"
                    sx={{ color: '#658285', fontWeight: 'bold' }}
                >
                    תרשים הוצאות לאורך זמן
                </Typography>
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
                            color: '#f44336',
                            id: 'expenseId',
                            showMark: true,
                            area: true,
                        }
                    ]}
                    xAxis={[{
                        data: chartData.xLabels,
                        scaleType: 'point',
                        tickLabelStyle: {
                            angle: 45,
                            textAnchor: 'start',
                            fontSize: 12,
                            fill: '#658285',
                        },
                    }]}
                    yAxis={[{
                        label: `סכום (${getCurrencySymbol(selectedCurrency)})`,
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
                            strokeDasharray: '0',
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
                            strokeDasharray: '3 3',
                            stroke: '#e0e0e0',
                        },
                    }}
                    margin={{
                        left: 60,
                        right: 20,
                        top: 20,
                        bottom: 50,
                    }}
                    disableAxisListener={true}
                    tooltip={{ trigger: 'item' }}
                />
            </Box>
        </Box>
    );
};

export default ExpensesChart; 