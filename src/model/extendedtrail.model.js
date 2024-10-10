const mongoose = require('mongoose');

const actionSchema = new mongoose.Schema({
  actionType: {
    type: String,
    enum: ['free', 'extend', 'changePlan'],
    required: true
  },
  planType: {
    type: String,
    enum: ['basic', 'standard', 'premium', 'freeTrial'],
    required: true
  },
  extendedDays: {
    type: String,
    required: function () {
      // `extendedDays` is required only if the `planType` is 'freeTrial'
      return this.planType === 'freeTrial';
    }
  },
  planDuration: {
    type: String,
    default: function () {
      // Set duration to 'Annual' by default for non-'freeTrial' plans
      return this.planType !== 'freeTrial' ? 'Annual' : null;
    }
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registration',  // Assuming there is a User schema that this references
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Action = mongoose.model('Action', actionSchema);

module.exports = Action;
