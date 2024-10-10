const Action = require('../model/extendedtrail.model');

// Create an action
exports.extendedPlan = async (req, res) => {
  const { actionType, planType, extendedDays, userId } = req.body;

  try {
    const newAction = new Action({
      actionType,
      planType,
      extendedDays,
      userId,
    });

    const savedAction = await newAction.save();
    res.status(201).json({
      success: true,
      message: 'Extended trail updated successfully',
      data: savedAction,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating action',
      error: error.message,
    });
  }
};

// Get all actions
exports.getAllActions = async (req, res) => {
  try {
    const actions = await Action.find();
    res.status(200).json({
      success: true,
      data: actions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching actions',
      error: error.message,
    });
  }
};

// Update an action
exports.updateAction = async (req, res) => {
  const { actionType, planType, extendedDays, userId } = req.body;

  try {
    const updatedAction = await Action.findByIdAndUpdate(
      req.params.id,
      { actionType, planType, extendedDays, userId },
      { new: true }
    );

    if (!updatedAction) {
      return res.status(404).json({
        success: false,
        message: 'Action not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Action updated successfully',
      data: updatedAction,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating action',
      error: error.message,
    });
  }
};

// Delete an action
exports.deleteAction = async (req, res) => {
  try {
    const deletedAction = await Action.findByIdAndDelete(req.params.id);

    if (!deletedAction) {
      return res.status(404).json({
        success: false,
        message: 'Action not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Action deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting action',
      error: error.message,
    });
  }
};
