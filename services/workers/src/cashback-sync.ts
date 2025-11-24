import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

interface AdmitadTransaction {
  id: string;
  subid: string;
  action_date: string;
  payment_amount: number;
  payment_status: string;
}

async function syncAdmitadCashback(): Promise<void> {
  const response = await fetch(
    `https://api.admitad.com/statistics/actions/?date_start=${getDateDaysAgo(30)}&limit=100`,
    {
      headers: {
        Authorization: `Bearer ${process.env.ADMITAD_ACCESS_TOKEN}`,
      },
    },
  );

  const data = await response.json();
  const transactions: AdmitadTransaction[] = data.results;

  for (const tx of transactions) {
    const [click] = await sql`
      SELECT * FROM offer_clicks
      WHERE click_id::text = ${tx.subid}
      LIMIT 1
    `;
    if (!click) continue;

    const [existing] = await sql`
      SELECT * FROM cashback_events
      WHERE affiliate_transaction_id = ${tx.id}
      LIMIT 1
    `;

    if (existing) {
      if (existing.status !== tx.payment_status) {
        await sql`
          UPDATE cashback_events
          SET
            status = ${tx.payment_status},
            updated_at = NOW()
          WHERE id = ${existing.id}
        `;

        if (tx.payment_status === "approved") {
          await creditCashbackToWallet(existing.id);
        }
      }
    } else {
      await sql`
        INSERT INTO cashback_events (
          user_id,
          offer_id,
          click_id,
          merchant_id,
          transaction_amount,
          commission_amount,
          cashback_amount,
          status,
          affiliate_transaction_id
        )
        VALUES (
          ${click.user_id},
          ${click.offer_id},
          ${click.click_id},
          (SELECT merchant_id FROM offers WHERE id = ${click.offer_id}),
          ${tx.payment_amount},
          ${tx.payment_amount * 0.05},
          ${tx.payment_amount * 0.03},
          ${tx.payment_status},
          ${tx.id}
        )
      `;
    }
  }
}

async function creditCashbackToWallet(cashbackEventId: number): Promise<void> {
  const [event] = await sql`
    SELECT * FROM cashback_events WHERE id = ${cashbackEventId}
  `;
  if (!event || event.paid_at) return;

  await sql`
    INSERT INTO wallet_transactions (
      user_id,
      amount,
      type,
      reference_type,
      reference_id,
      balance_before,
      balance_after,
      description
    )
    SELECT
      ${event.user_id},
      ${event.cashback_amount},
      'cashback_earned',
      'cashback_event',
      ${cashbackEventId},
      u.wallet_balance,
      u.wallet_balance + ${event.cashback_amount},
      'Cashback from ' || m.name
    FROM users u
    JOIN merchants m ON m.id = ${event.merchant_id}
    WHERE u.id = ${event.user_id}
  `;

  await sql`
    UPDATE users
    SET
      wallet_balance = wallet_balance + ${event.cashback_amount},
      lifetime_earnings = lifetime_earnings + ${event.cashback_amount},
      updated_at = NOW()
    WHERE id = ${event.user_id}
  `;

  await sql`
    UPDATE cashback_events
    SET paid_at = NOW(), updated_at = NOW()
    WHERE id = ${cashbackEventId}
  `;

  await sql`
    INSERT INTO email_queue (type, to, data)
    SELECT
      'cashback_confirmed',
      u.email,
      jsonb_build_object(
        'user_name', u.full_name,
        'cashback_amount', ${event.cashback_amount},
        'merchant_name', m.name
      )
    FROM users u
    JOIN merchants m ON m.id = ${event.merchant_id}
    WHERE u.id = ${event.user_id}
  `;
}

function getDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0];
}

async function runScheduledSync(): Promise<void> {
  while (true) {
    try {
      console.log("Starting cashback sync...");
      await syncAdmitadCashback();
      console.log("Cashback sync completed");
    } catch (error) {
      console.error("Error in cashback sync:", error);
    }

    await Bun.sleep(6 * 60 * 60 * 1000);
  }
}

console.log("💰 Cashback sync worker started");
runScheduledSync();
