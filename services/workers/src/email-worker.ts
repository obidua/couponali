import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

interface EmailJob {
  id: number;
  type: string;
  to: string;
  data: any;
}

async function sendEmail(job: EmailJob): Promise<void> {
  console.log(`Sending ${job.type} email to ${job.to}`);

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: job.to }] }],
      from: { email: "noreply@yourcoupondomain.com" },
      subject: getEmailSubject(job.type),
      content: [{ type: "text/html", value: getEmailTemplate(job.type, job.data) }],
    }),
  });

  if (!response.ok) {
    throw new Error(`SendGrid error: ${response.statusText}`);
  }
}

function getEmailSubject(type: string): string {
  const subjects: Record<string, string> = {
    welcome: "Welcome to CouponCommerce!",
    order_confirmation: "Order Confirmed - Your Vouchers",
    cashback_confirmed: "Cashback Credited to Your Wallet",
    withdrawal_processed: "Withdrawal Processed Successfully",
  };
  return subjects[type] || "Notification";
}

function getEmailTemplate(type: string, data: any): string {
  if (type === "order_confirmation") {
    return `
      <h1>Order Confirmed!</h1>
      <p>Hi ${data.user_name},</p>
      <p>Your order <strong>${data.order_number}</strong> has been confirmed.</p>
      <p>Total: ₹${data.total_amount}</p>
      <p>View your vouchers: <a href="${data.order_url}">Click here</a></p>
    `;
  }
  return `<p>${JSON.stringify(data)}</p>`;
}

async function processEmailQueue(): Promise<void> {
  while (true) {
    const jobs = await sql<EmailJob[]>`
      UPDATE email_queue
      SET status = 'processing', attempts = attempts + 1
      WHERE id IN (
        SELECT id FROM email_queue
        WHERE status = 'pending'
        ORDER BY created_at
        LIMIT 10
      )
      RETURNING *
    `;

    if (jobs.length === 0) {
      await Bun.sleep(5000);
      continue;
    }

    for (const job of jobs) {
      try {
        await sendEmail(job);
        await sql`
          UPDATE email_queue
          SET status = 'completed'
          WHERE id = ${job.id}
        `;
      } catch (error) {
        console.error(`Error sending email ${job.id}:`, error);
        if (job.attempts >= 3) {
          await sql`
            UPDATE email_queue
            SET status = 'failed'
            WHERE id = ${job.id}
          `;
        } else {
          await sql`
            UPDATE email_queue
            SET status = 'pending'
            WHERE id = ${job.id}
          `;
        }
      }
    }
  }
}

console.log("📧 Email worker started");
processEmailQueue();
