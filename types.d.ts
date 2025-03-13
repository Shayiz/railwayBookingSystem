export type CreateVendor = {
  vendorName: string;
  vendorLocation: string;
};

export type CreateBooking = {
  customerName: string;
  bookingDate: string;
  amount: number;
  vendorId: string;
};
