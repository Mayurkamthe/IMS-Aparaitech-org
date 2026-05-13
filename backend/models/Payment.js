const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  intern: { type: mongoose.Schema.Types.ObjectId, ref: 'Intern', required: true },
  type: { type: String, enum: ['onboarding', 'final'], required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['paid', 'pending', 'overdue', 'waived'], default: 'pending' },
  dueDate: Date,
  paidDate: Date,
  transactionId: String,
  paymentMethod: { type: String, enum: ['cash','upi','bank_transfer','card','other'], default: 'upi' },
  notes: String,
  invoiceNumber: { type: String, unique: true, sparse: true },
  domain: { type: mongoose.Schema.Types.ObjectId, ref: 'Domain' },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Auto invoice number
paymentSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const count = await this.constructor.countDocuments();
    const prefix = this.type === 'onboarding' ? 'I1025' : 'I4025';
    this.invoiceNumber = `${prefix}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
