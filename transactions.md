Below is a complete, from-scratch → advanced explanation of MongoDB Transactions, with real-world, practical examples, pitfalls, and best practices. I’ll explain this assuming you already know MongoDB + Node.js (MERN), and I’ll show Node.js (Mongoose & native driver) examples where useful.

1️⃣ Why Transactions Exist (Problem Statement)

MongoDB was originally non-transactional across multiple documents.

Example (Without Transaction – Problem)
// Step 1: Deduct money
db.accounts.updateOne({ _id: 1 }, { $inc: { balance: -500 } })

// Step 2: Add money
db.accounts.updateOne({ _id: 2 }, { $inc: { balance: 500 } })


❌ If step 1 succeeds and step 2 fails, data becomes inconsistent.

➡️ Transactions solve this by guaranteeing ACID properties.

2️⃣ What is a Transaction in MongoDB?

A transaction is a group of operations that are:

ACID Properties
Property	Meaning
Atomicity	All operations succeed or all fail
Consistency	DB moves from one valid state to another
Isolation	Concurrent transactions don’t interfere
Durability	Committed data is permanently saved
3️⃣ When MongoDB Supports Transactions
Requirements

✔ MongoDB 4.0+ → Replica Set
✔ MongoDB 4.2+ → Sharded Cluster
❌ Standalone MongoDB → No transactions

4️⃣ Transaction Scope (Important)

MongoDB transactions:

Work across multiple collections

Work across multiple documents

Work within one database

Can span multiple databases (same replica set)

5️⃣ Basic Transaction Flow

Start session

Start transaction

Execute operations

Commit or Abort

End session

6️⃣ Basic Example (Native MongoDB Driver)
Scenario: Bank Transfer
const session = client.startSession()

try {
  session.startTransaction()

  await accounts.updateOne(
    { _id: 1 },
    { $inc: { balance: -500 } },
    { session }
  )

  await accounts.updateOne(
    { _id: 2 },
    { $inc: { balance: 500 } },
    { session }
  )

  await session.commitTransaction()
  console.log("Transaction committed")
} catch (error) {
  await session.abortTransaction()
  console.log("Transaction aborted")
} finally {
  session.endSession()
}


✔ Either both updates happen
❌ Or none happen

7️⃣ Same Example Using Mongoose
const session = await mongoose.startSession()

try {
  session.startTransaction()

  await Account.updateOne(
    { _id: senderId },
    { $inc: { balance: -500 } },
    { session }
  )

  await Account.updateOne(
    { _id: receiverId },
    { $inc: { balance: 500 } },
    { session }
  )

  await session.commitTransaction()
} catch (err) {
  await session.abortTransaction()
} finally {
  session.endSession()
}

8️⃣ Real-World Example: E-Commerce Order (Practical)
Problem

Create order

Reduce product stock

Clear cart

All must succeed together.

Collections

orders

products

carts

Transaction Code
const session = await mongoose.startSession()

try {
  session.startTransaction()

  // 1. Create order
  const order = await Order.create([{
    userId,
    items,
    totalAmount
  }], { session })

  // 2. Reduce stock
  for (let item of items) {
    await Product.updateOne(
      { _id: item.productId, stock: { $gte: item.qty } },
      { $inc: { stock: -item.qty } },
      { session }
    )
  }

  // 3. Clear cart
  await Cart.deleteOne({ userId }, { session })

  await session.commitTransaction()
  return order

} catch (err) {
  await session.abortTransaction()
  throw err
} finally {
  session.endSession()
}

9️⃣ Transaction Isolation Levels (MongoDB)

MongoDB uses Snapshot Isolation:

Each transaction sees data as it existed at the start

Prevents dirty reads

Allows non-blocking reads

🔟 Read & Write Concerns in Transactions
Default (Recommended)
session.startTransaction({
  readConcern: { level: "snapshot" },
  writeConcern: { w: "majority" }
})

Concern	Purpose
readConcern	Consistency level
writeConcern	Replication guarantee
1️⃣1️⃣ Handling Transaction Retries (Very Important)

Some errors are transient.

MongoDB Recommends Retry Logic
async function runTransaction(txnFunc) {
  while (true) {
    const session = await mongoose.startSession()
    try {
      session.startTransaction()
      await txnFunc(session)
      await session.commitTransaction()
      break
    } catch (err) {
      if (err.hasErrorLabel("TransientTransactionError")) {
        continue // retry
      }
      await session.abortTransaction()
      throw err
    } finally {
      session.endSession()
    }
  }
}

1️⃣2️⃣ Transaction Limitations (Critical for Interviews)
Limitation	Explanation
60 seconds	Max execution time
16MB	Document size
No parallel ops	Inside same transaction
Slower	Locks + overhead
Requires replica set	Standalone won’t work
1️⃣3️⃣ When NOT to Use Transactions

❌ Logging
❌ Analytics
❌ Independent operations
❌ High-frequency writes

Instead:

Use atomic operators ($inc, $push)

Use two-phase commit pattern

1️⃣4️⃣ Transactions vs Atomic Operations
Feature	Atomic Operator	Transaction
Single doc	✅	❌ (overkill)
Multiple docs	❌	✅
Performance	Fast	Slower
Complexity	Low	High
1️⃣5️⃣ Advanced Pattern: Two-Phase Commit (Without Transactions)

Used before MongoDB 4.0 or in high-scale systems.

Steps

Mark intent

Perform actions

Commit

Cleanup

Used in distributed systems.

1️⃣6️⃣ Best Practices (Industry Level)

✔ Keep transactions short
✔ Avoid user input inside transactions
✔ Always use try/catch/finally
✔ Retry on transient errors
✔ Monitor slow transactions
✔ Prefer atomic ops when possible

1️⃣7️⃣ Interview-Ready Summary

MongoDB transactions allow multi-document, multi-collection ACID operations in replica sets and sharded clusters. They ensure data consistency but add overhead, so they should be used only when atomicity across multiple operations is required.

If you want next:

🔥 MongoDB transactions interview Q&A

🔥 High-scale order system design

🔥 Transactions vs Saga pattern

🔥 Hands-on MERN mini project using transactions

Just tell me 👍