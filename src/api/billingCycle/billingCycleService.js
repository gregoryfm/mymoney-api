const BillingCycle = require('./billingCycle');

BillingCycle.methods(['get', 'post', 'put', 'delete']);
BillingCycle.updateOptions({ new: true, runValidators: true });

BillingCycle.route('count', (req, res, next) => {
  BillingCycle.count(( error, value ) => {
    if (error) {
      res.status(500).json({ errors: [error] });
    } else {
      res.json({ value });
    }
  });
})

BillingCycle.route('summary', (req, res, next) => {
  BillingCycle.aggregate({
    $project: { creditProject: {$sum: '$credits.value'}, debitProject: {$sum: '$debits.value'}}
  },{
    $group: { _id: null, credit: {$sum: '$creditProject'}, debit: {$sum: '$debitProject'}}
  },{
    $project: { _id: 0, credit: 1, debit: 1 }
  }, ( error, result ) => {
    if (error) {
      res.status(500).json({ errors: [error] })
    } else {
      res.json(result[0] || { credit: 0, debit: 0 });
    }
  })
});

module.exports = BillingCycle;
