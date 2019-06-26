/*
Tools: https://stackoverflow.com/questions/48695434/how-to-replace-bindthis-in-es6
 */

var moment = require('moment');

const JS_EOL = '\n';
class Payment{
    constructor(options){
        this.Payment_Number = options['Payment_Number'];
        this.Date = options['Date'];
        this.Beginning_balance = options['Beginning_balance'];
        this.Interest_Due = options['Interest_Due'];
        this.Principal_Due = options['Principal_Due'];
        this.Property_Tax = options['Property_Tax'];
        this.PMI_Payment = options['PMI_Payment'];
        this.Homeowners_Insurance_Payment = options['Homeowners_Insurance_Payment'];
        this.Principal_Paid = options['Principal_Paid'];
        this.Payment_Made = options['Payment_Made'];
        this.Total_Payment = options['Total_Payment'];
        this.Payoff_Percentage = options['Payoff_Percentage'];
    }
    write(){
        console.log('Payment:' + this.Payment_Number + JS_EOL);
    }
}
const PMI = Object.freeze({
    CHASE:   Symbol("chase"),
});

class MortgageCalculator{
    constructor(options){
        this.LTV_Rates = Object.freeze({
            95:   Symbol(.54),
            90:   Symbol(.31),
            85:   Symbol(.25),
            80:   Symbol(0),
        });
        this.house_price = options['house_price'];
        this.starting_date = options['starting_date'];
        this.extra_payments = options['extra_payments'];
        this.interest_rate = options['interest_rate'];
        this.loan_period = options['loan_period'];
        this.property_tax_rate = options['property_tax_rate'];
        this.PMI = options['PMI'];
        this.payment_burndown = [];
        this.down_payment = options['down_payment'];
        this.loan_amount = this.house_price - this.down_payment;
        this.homeowners_insurance = options['homeowners_insurance'];

    }
    /*
    PMT(rate, number_of_periods, present_value, [future_value, end_or_beginning])
     */
    static PMT(rate , number_of_periods , present_value, future_value = 0, end_or_beginning = 0 ) {
        if (rate === 0) return -(present_value + future_value)/number_of_periods;

        let pvif = Math.pow(1 + rate, number_of_periods);
        let pmt = rate / (pvif - 1) * -(present_value * pvif + future_value);

        if (end_or_beginning === 1) {
            pmt /= (1 + rate);
        }

        return pmt;
    }

    Get_Property_Tax_Per_Payment(){
        return (this.house_price * this.property_tax_rate) / 12;
    }

    Get_PMI_Cost_Per_Payment(){
        if(this.down_payment /  this.house_price >= .2){
            return 0;
        }else{
            return (.0054 * this.loan_amount)/12;
        }
    }
    Get_Homeowners_Insurance_Per_Payment(){
        return this.homeowners_insurance /12;
    }
    Get_Extra_Payment(PaymentNumber){
        return  PaymentNumber in this.extra_payments ? this.extra_payments[PaymentNumber] : 0;
    }
    Evaluate(){
        let payment_number = 1;
        const starting_date = moment(this.starting_date, "MM-DD-YYYY");
        let current_balance = this.loan_amount;
        let Regular_Payment = -MortgageCalculator.PMT(this.interest_rate / 12, this.loan_period * 12, this.loan_amount);
        let PropertyTax = this.Get_Property_Tax_Per_Payment();
        let PMI_Payment = this.Get_PMI_Cost_Per_Payment();
        let homeowners_insurance = this.Get_Homeowners_Insurance_Per_Payment();

        do{
            let Interest = current_balance*( this.interest_rate / 12);
            let Principal_Due = Regular_Payment - Interest;
            let ExtraPayment = this.Get_Extra_Payment(payment_number);
            let Principal_Paid = Principal_Due + ExtraPayment;
            let Payment_Made = Interest + Principal_Due + PropertyTax + PMI_Payment;
            let Total_Payment = Payment_Made + homeowners_insurance;
            let Ending_Balance = current_balance - Principal_Paid;
            let Payoff_Percentage = Ending_Balance / this.house_price;

            let payment = new Payment({
                Payment_Number: payment_number,
                Date: starting_date.format('MMMM Do YYYY'),
                Beginning_balance: current_balance,
                Interest_Due: Interest,
                Principal_Due: Principal_Due ,
                Property_Tax: PropertyTax,
                PMI_Payment: PMI_Payment,
                Homeowners_Insurance_Payment: homeowners_insurance,
                Principal_Paid: Principal_Paid ,
                Payment_Made: Payment_Made,
                Total_Payment: Total_Payment,
                Payoff_Percentage: Payoff_Percentage,
            });
            this.payment_burndown.push(payment);
            starting_date.add(1, 'months');
            current_balance = Ending_Balance;
            payment_number++;
        }while (current_balance > 0);
        console.log(this.payment_burndown);
    }
    GetPaymentCount(){
        return this.payment_burndown.length;
    }
}
module.exports = {MortgageCalculator, PMI};
