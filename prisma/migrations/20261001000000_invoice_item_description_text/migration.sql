-- Allow invoice line descriptions to match the longer quotation and catalogue descriptions.
ALTER TABLE `InvoiceItem` MODIFY `description` TEXT NOT NULL;
