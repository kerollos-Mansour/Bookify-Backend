const mongoose = require('mongoose');

function calculateNights(checkIn, checkOut) {
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);

    if (isNaN(inDate) || isNaN(outDate) || inDate >= outDate) {
        throw new Error('Invalid check-in or check-out dates');
    }
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.round((outDate - inDate) / oneDay);
}

function generateBookingNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String((date.getMonth() + 1)).padStart(2, '0');

    const datePart = `${year}${day}${month}`;
    const rand = Math.floor(Math.random() * 900000) + 100000;
    return `${datePart}-${rand}`;
}

function calculateTotalPrice({ pricePerNight, nights, taxes = 0, fees = 0, discount = 0 }) {
    const subtotal = Number(pricePerNight) * Number(nights);
    const totalBeforeDiscount = subtotal + Number(taxes) + Number(fees);
    const totalPrice = totalBeforeDiscount - Number(discount);

    return {
        nights,
        subtotal: subtotal.toFixed(2),
        taxes: taxes.toFixed(2),
        fees: fees.toFixed(2),
        discount:discount.toFixed(2),
        total: totalPrice.toFixed(2)
    };
}

module.exports = {
    calculateNights,
    generateBookingNumber,
    calculateTotalPrice
};