namespace Pharmacy.Application.DTO
{
    public class VerifyPaymentRequest
    {
        public string RazorpayPaymentId { get; set; } = string.Empty;

        public string RazorpayOrderId { get; set; } = string.Empty;

        public string RazorpaySignature { get; set; } = string.Empty;
    }
}
