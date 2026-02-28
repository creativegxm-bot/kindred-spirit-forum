
DROP POLICY IF EXISTS "Anyone can submit advertise inquiries" ON advertise_inquiries;
CREATE POLICY "Anyone can submit advertise inquiries" ON advertise_inquiries FOR INSERT WITH CHECK (true);
