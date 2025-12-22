const PaymentMethod = require("../../../shared/models/paymentMethod.model");
const AppError = require("../../../shared/utils/appError.utils");

const createPaymentMethod = async (user, data) => {
  const { cardNumber, cardHolderName, expiryDate, bank, isDefault } = data;

  if (!cardNumber || !cardHolderName || !expiryDate) {
    throw new AppError("Card number, card holder name, and expiry date are required", 400);
  }

  if (cardNumber.length < 12 || cardNumber.length > 19) {
    throw new AppError("Card number must be between 12 and 19 digits", 400);
  }

  const expiryRegex = /^\d{4}\/(0[1-9]|1[0-2])$/;
  if (!expiryRegex.test(expiryDate)) {
    throw new AppError("Expiry date must be in YYYY/MM format", 400);
  }

  const [year, month] = expiryDate.split("/").map(Number);
  const expiry = new Date(year, month - 1, 1);
  const now = new Date();
  if (expiry < now) {
    throw new AppError("Card has already expired", 400);
  }

  const method = new PaymentMethod({
    userId: user._id,
    cardNumber,
    cardHolderName,
    expiryDate,
    bank,
    isDefault: isDefault || false
  });

  await method.save();
  return method;
};

const getUserPaymentMethods = async (user) => {
  if (!user || !user._id) {
    throw new AppError("User not found", 404);
  }

  const methods = await PaymentMethod.find({ userId: user._id });
  if (!methods || methods.length === 0) {
    throw new AppError("No payment methods found for this user", 404);
  }
  return methods;
};

const deletePaymentMethod = async (user, id) => {
  const method = await PaymentMethod.findById(id);
  if (!method || method.userId.toString() !== user._id.toString()) {
    throw new AppError("Payment method not found or access denied", 404);
  }
  await PaymentMethod.findByIdAndDelete(id);
  return method;
};

module.exports = { createPaymentMethod, getUserPaymentMethods, deletePaymentMethod };
