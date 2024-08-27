const transactionModel = require('../models/transactionModel')
const userModel = require('../models/userModel')
const moment=require('moment')

const getAllTransaction= async(req,res)=>{
    try{
        const {frequency,selectedDate,category}=req.body
        const transaction = await transactionModel.find({
            ...(frequency!=='custom'?{
                date:{
                    $gt : moment().subtract(Number(frequency),'d').toDate(),
                },
            }:{
                date:{
                    $gte : selectedDate[0],
                    $lte : selectedDate[1],
                }
            }),
            userid: req.body.userid,
            ...(category!=='All items' && {category} )
        }).sort({ date: -1 });
        res.status(200).json(transaction);
    }catch(error){
        console.log(error);
        res.status(500).json(error)
    }
}

const editTransaction= async (req,res)=>{
    try{
        await transactionModel.findOneAndUpdate(
            {_id:req.body.transactionid},
            req.body.payload);
        res.status(200).send('Edited successfully')
    }catch(error){
        console.log(error)
        res.status(500).json(error)
    }
}

const deleteTransaction=async (req,res)=>{
    try{
        await transactionModel.findOneAndDelete({_id:req.body.transactionid})
        res.status(200).send('Transaction deleted')
    }catch(error){
        console.log(error);
        res.status(500).json(error)
    }
};
const addTransaction=async (req,res)=>{
    try{
        const newTransaction = new transactionModel(req.body);
        await newTransaction.save()
        res.status(201).send('Transaction created')
    }catch(error){
        console.log(error);
        res.status(500).json(error);
    }
}

const getTotalStats=async(req,res)=>{
    const userid=req.params.userid
    console.log('user:',userid);
    try{
        const incomeResult = await transactionModel.aggregate([
            {
                $match:{
                    userid:userid,
                    type:'income'
                }
            },
            {
                $group:{
                    _id:null,
                    totalIncome :{ $sum : '$amount'}
                }
            }
        ]);

        const expenseResult = await transactionModel.aggregate([
            {
                $match:{
                    userid:userid,
                    type:'expense',
                }
            },
            {
                $group:{
                    _id:null,
                    totalExpense:{$sum:'$amount'}
                }
            }
        ]);
        const totalIncome = incomeResult.length>0? Math.floor(incomeResult[0].totalIncome):0;
        const totalExpense = expenseResult.length>0? Math.floor(expenseResult[0].totalExpense):0;
        const balance = totalIncome-totalExpense;

        res.json({totalIncome,totalExpense,balance});
    }catch(error){
        res.json({message:'No stats found'})
    }
}

const getWeeklyTransaction=async(req,res)=>{
    const userid=req.params.userid;
    try{
        const currentDate= new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(currentDate.getDate()-7);

        //utc timezones
        const utcCurrentDate = new Date(Date.UTC(currentDate.getUTCFullYear(),currentDate.getUTCMonth(),currentDate.getUTCDate()));
        const utcSevenDaysAgo = new Date(Date.UTC(sevenDaysAgo.getUTCFullYear(),sevenDaysAgo.getUTCMonth(),sevenDaysAgo.getUTCDate()));

        const weeklyData = await transactionModel.aggregate([
            {
                $match:{
                    userid:userid,
                    date:{$gte : utcSevenDaysAgo, $lte: utcCurrentDate},
                },
            },
            {
                $group:{
                    _id:{
                        $dateToString : {format:'%Y-%m-%d', date:'$date'}
                    },
                    totalIncome:{
                        $sum:{
                            $cond:[{$eq : ['$type','income']}, '$amount',0]
                        },
                    },
                    totalExpense:{
                        $sum:{
                            $cond:[{$eq:['$type','expense']},'$amount',0],
                        },
                    },
                },
            },
            {
                $project:{
                    date:'$_id',
                    totalIncome:1,
                    totalExpense:1,
                    _id:0,
                },
            },
            {
                $sort : {date:1},
            },
        ]);

        res.json({weeklyData});
    }catch(error){
        console.log(error);
        res.status(500).json({message : 'Internal Server Error'});
    }
};

const getMonthlyTransaction = async (req, res) => {
    const userid = req.params.userid;
  
    try {
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  
      const monthlyData = await transactionModel.aggregate([
        {
          $match: {
            userid: userid,
            date: { $gte: firstDayOfMonth, $lte: currentDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m', date: '$date' },
            },
            totalIncome: {
              $sum: {
                $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0],
              },
            },
            totalExpense: {
              $sum: {
                $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0],
              },
            },
          },
        },
        {
          $project: {
            month: '$_id',
            totalIncome: 1,
            totalExpense: 1,
            _id: 0,
          },
        },
        {
          $sort: { month: 1 },
        },
      ]);
  
      res.json({ monthlyData });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  
const getYearlyTransaction = async (req, res) => {
    const userid = req.params.userid;
  
    try {
      const currentDate = new Date();
      const firstDayOfYear = new Date(currentDate.getFullYear(), 0, 1);
  
      const yearlyData = await transactionModel.aggregate([
        {
          $match: {
            userid: userid,
            date: { $gte: firstDayOfYear, $lte: currentDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y', date: '$date' },
            },
            totalIncome: {
              $sum: {
                $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0],
              },
            },
            totalExpense: {
              $sum: {
                $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0],
              },
            },
          },
        },
        {
          $project: {
            year: '$_id',
            totalIncome: 1,
            totalExpense: 1,
            _id: 0,
          },
        },
        {
          $sort: { year: 1 },
        },
      ]);
  
      res.json({ yearlyData });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

const getCategoryWiseTransaction = async(req,res)=>{
    const id = req.params.userid
    try{
        const categoryData = await transactionModel.aggregate([
            {
                $match:{
                    userid:id,
                },
            },
            {
                $group:{
                _id:{$toLower:'$category'},
                totalIncome:{
                    $sum:{
                        $cond:[{$eq:['$type','income']},'$amount',0],
                    },
                },
                totalExpense:{
                    $sum:{
                        $cond:[{$eq:['$type','expense']},'$amount',0],
                    },
                },
                },
            },
        ]);
        res.json(categoryData)
    }catch(error){
        console.log(error);
    }
}

module.exports={getAllTransaction,addTransaction,editTransaction,deleteTransaction,getWeeklyTransaction,getTotalStats,getMonthlyTransaction,getYearlyTransaction,getCategoryWiseTransaction};