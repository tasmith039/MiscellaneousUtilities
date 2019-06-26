require('dotenv').config();
var _ = require('underscore');
var moment = require('moment');
var MortgageCalculator = require('./utilities/mortgage/MortgageCalculator').MortgageCalculator;
var PMI = require('./utilities/mortgage/MortgageCalculator').PMI;


const isDebug = process.env.IS_DEBUG || true;


let calculator = new MortgageCalculator({
    house_price: 160500,
    closing_costs: 0,
    down_payment: 8025,
    starting_date: '05-01-2017', // MM-DD-YYYY
    loan_period: 30,
    extra_payments:{
        3: 1000,
        4: 1000
    },
    interest_rate : .04125,
    property_tax_rate: .0215,
    homeowners_insurance: 1000,
    PMI: {
        type: PMI.CHASE
    }
});
calculator.Evaluate();