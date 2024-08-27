const express = require('express');
const { addTransaction, getAllTransaction,editTransaction,deleteTransaction,getTotalStats,getWeeklyTransaction
    ,getMonthlyTransaction,getYearlyTransaction,getCategoryWiseTransaction} 
    = require('../controllers/transactionController');


//router
const router=express.Router()

//add transaction
router.post('/add-transaction',addTransaction);
//Edit
router.post('/edit-transaction',editTransaction);
//deleted
router.post('/delete-transaction',deleteTransaction);

//get transactions
router.post('/get-transaction',getAllTransaction);

//charts
router.get('/get-totalStats/:userid',getTotalStats)
router.get('/get-weeklyTransaction/:userid',getWeeklyTransaction)
router.get('/get-monthlyTransaction/:userid',getMonthlyTransaction)
router.get('/get-yearlyTransaction/:userid',getYearlyTransaction)
router.get('/get-categoryWiseTransaction/:userid',getCategoryWiseTransaction)



module.exports=router;