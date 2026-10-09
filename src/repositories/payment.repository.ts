import prisma from "../lib/prisma.js";

export const paymentRepository = {
  list(userId: number) {
    return prisma.payment.findMany({
      where: { createdById: userId },
      // include: {
      //   invoice: { select: { id: true, clientName: true, grandTotal: true } },
      // },
      orderBy: [{ date: "desc" }, { id: "desc" }],
    });
  },
  findOwned(id: number, userId: number) {
    return prisma.payment.findFirst({ where: { id, createdById: userId } });
  },
  invoice(invoiceId: number, userId: number) {
    return prisma.invoice.findFirst({
      where: { id: invoiceId, createdById: userId },
      include: { payments: true },
    });
  },
  async create(
    userId: number,
    input: {
      invoiceId: number;
      amount: number;
      date: Date;
      method: string;
      reference: string | null;
      notes: string | null;
    },
  ) {
    return prisma.$transaction(
      async (tx) => {
        const invoice = await tx.invoice.findFirst({
          where: { id: input.invoiceId, createdById: userId },
          include: { payments: true },
        });
        if (!invoice) return null;
        const total =
          invoice.payments.reduce((sum, p) => sum + p.amount, 0) + input.amount;
        if (total > invoice.grandTotal + 0.005)
          throw new Error("PAYMENT_EXCEEDS_BALANCE");
        const payment = await tx.payment.create({
          data: { ...input, createdById: userId },
          include: {
            invoice: {
              select: { id: true, clientName: true, grandTotal: true },
            },
          },
        });
        await tx.invoice.update({
          where: { id: invoice.id },
          data: {
            paymentStatus:
              total >= invoice.grandTotal - 0.005 ? "PAID" : "PARTIAL",
          },
        });
        return payment;
      },
      { isolationLevel: "Serializable" },
    );
  },
  async update(
    id: number,
    userId: number,
    input: {
      invoiceId: number;
      amount: number;
      date: Date;
      method: string;
      reference: string | null;
      notes: string | null;
    },
  ) {
    return prisma.$transaction(
      async (tx) => {
        const existing = await tx.payment.findFirst({
          where: { id, createdById: userId },
        });
        if (!existing) return null;
        const oldInvoice = await tx.invoice.findFirst({
          where: { id: existing.invoiceId, createdById: userId },
          include: { payments: true },
        });
        const newInvoice =
          existing.invoiceId === input.invoiceId
            ? oldInvoice
            : await tx.invoice.findFirst({
                where: { id: input.invoiceId, createdById: userId },
                include: { payments: true },
              });
        if (!newInvoice) return null;
        const newTotal =
          newInvoice.payments
            .filter((p) => p.id !== id)
            .reduce((sum, p) => sum + p.amount, 0) + input.amount;
        if (newTotal > newInvoice.grandTotal + 0.005)
          throw new Error("PAYMENT_EXCEEDS_BALANCE");
        const payment = await tx.payment.update({
          where: { id },
          data: { ...input, createdById: userId },
          include: {
            invoice: {
              select: { id: true, clientName: true, grandTotal: true },
            },
          },
        });
        await tx.invoice.update({
          where: { id: newInvoice.id },
          data: {
            paymentStatus:
              newTotal >= newInvoice.grandTotal - 0.005
                ? "PAID"
                : newTotal > 0
                  ? "PARTIAL"
                  : "UNPAID",
          },
        });
        if (oldInvoice && oldInvoice.id !== newInvoice.id) {
          const oldTotal = oldInvoice.payments
            .filter((p) => p.id !== id)
            .reduce((sum, p) => sum + p.amount, 0);
          await tx.invoice.update({
            where: { id: oldInvoice.id },
            data: {
              paymentStatus:
                oldTotal >= oldInvoice.grandTotal - 0.005
                  ? "PAID"
                  : oldTotal > 0
                    ? "PARTIAL"
                    : "UNPAID",
            },
          });
        }
        return payment;
      },
      { isolationLevel: "Serializable" },
    );
  },
  async delete(id: number, userId: number) {
    return prisma.$transaction(
      async (tx) => {
        const payment = await tx.payment.findFirst({
          where: { id, createdById: userId },
        });
        if (!payment) return false;
        await tx.payment.delete({ where: { id } });
        const invoice = await tx.invoice.findFirst({
          where: { id: payment.invoiceId, createdById: userId },
          include: { payments: true },
        });
        if (invoice) {
          const total = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
          await tx.invoice.update({
            where: { id: invoice.id },
            data: {
              paymentStatus:
                total >= invoice.grandTotal - 0.005
                  ? "PAID"
                  : total > 0
                    ? "PARTIAL"
                    : "UNPAID",
            },
          });
        }
        return true;
      },
      { isolationLevel: "Serializable" },
    );
  },
};
