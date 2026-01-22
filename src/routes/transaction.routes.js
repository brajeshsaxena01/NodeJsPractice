const express = require('express')
const router = express.Router()
const { Account } = require("../models/accounts.model")

router.post("/transfer", async (req, res) => {
    const { fromId, toId, amount } = req.body
    const session = await mongoose.startSession()

    try {
        session.startTransaction({
            writeConcern: { w: "majority", j: true }
        })

        // 1️⃣ CONSISTENCY: Business rule check
        const sender = await Account.findById(fromId).session(session)

        if (!sender) throw new Error("Sender not found")
        if (sender.balance < amount) {
            throw new Error("Insufficient balance")
        }

        // 2️⃣ ATOMIC UPDATES
        await Account.updateOne(
            { _id: fromId },
            { $inc: { balance: -amount } },
            { session }
        )

        await Account.updateOne(
            { _id: toId },
            { $inc: { balance: amount } },
            { session }
        )

        // 3️⃣ ISOLATION
        // Automatically handled by MongoDB snapshot isolation

        // 4️⃣ DURABILITY
        // Guaranteed by writeConcern + commitTransaction

        await session.commitTransaction()

        res.send({ message: "Money transferred successfully" })

    } catch (err) {
        await session.abortTransaction()
        res.status(400).send({ error: err.message })
    } finally {
        session.endSession()
    }
})

// Production ready
router.post("/transfer", async (req, res) => {
    const { fromId, toId, amount } = req.body
    const session = await mongoose.startSession()

    const MAX_RETRIES = 3

    try {
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                session.startTransaction({
                    writeConcern: { w: "majority", j: true }
                })

                // 1️⃣ CONSISTENCY CHECK
                const sender = await Account.findById(fromId).session(session)

                if (!sender) {
                    throw new Error("Sender not found")
                }

                if (sender.balance < amount) {
                    throw new Error("Insufficient balance")
                }

                // 2️⃣ ATOMIC DEBIT
                await Account.updateOne(
                    { _id: fromId },
                    { $inc: { balance: -amount } },
                    { session }
                )

                // 3️⃣ ATOMIC CREDIT
                const receiverResult = await Account.updateOne(
                    { _id: toId },
                    { $inc: { balance: amount } },
                    { session }
                )

                if (receiverResult.matchedCount === 0) {
                    throw new Error("Receiver not found")
                }

                // 4️⃣ COMMIT (Isolation + Durability enforced here)
                await session.commitTransaction()

                return res.status(200).json({
                    message: "Money transferred successfully"
                })

            } catch (err) {
                await session.abortTransaction()

                // 🔁 RETRY on write conflict / transient errors
                if (
                    err.hasErrorLabel &&
                    err.hasErrorLabel("TransientTransactionError") &&
                    attempt < MAX_RETRIES
                ) {
                    continue
                }

                throw err
            }
        }

        throw new Error("Transaction failed after multiple retries")

    } catch (err) {
        res.status(400).json({ error: err.message })
    } finally {
        session.endSession()
    }
})
