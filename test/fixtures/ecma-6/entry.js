class Mortgage {
  constructor(principal, years, rate) {
    this.principal = principal;
    this.years = years;
    this.rate = rate;
  }

  get monthlyPayment() {
    let monthlyRate = this.rate / 100 / 12;

    return this.principal * monthlyRate / (1 - (Math.pow(1/(1 + monthlyRate), this.years * 12)));
  }

  get amortization() {
    let monthlyPayment = this.monthlyPayment;
    let monthlyRate = this.rate / 100 / 12;
    let balance = this.principal;
    let amortization = [];

    for (let y=0; y<this.years; y++) {
      let interestY = 0;
      let principalY = 0;
      for (let m=0; m<12; m++) {
        let interestM = balance * monthlyRate;
        let principalM = monthlyPayment - interestM;
        interestY = interestY + interestM;
        principalY = principalY + principalM;
        balance = balance - principalM;
      }
      amortization.push({principalY, interestY, balance});
    }

    return amortization;
  }
}

(function() {
  var zzz = {};
  var abc = {
    data() {
      return {
        a: 2
      };
    }};
  console.log(abc)
})();

module.exports = Mortgage;
