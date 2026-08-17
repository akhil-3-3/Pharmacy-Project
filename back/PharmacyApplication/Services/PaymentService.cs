using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Org.BouncyCastle.Asn1.Ocsp;
using Razorpay.Api;
using System.Security.Cryptography;
using System.Text;

namespace Pharmacy.Application.Services
{
    public class PaymentService
    {
        private readonly IConfiguration _config;

        public PaymentService(IConfiguration config)
        {
            _config = config;
        }

        public Order CreateOrder(decimal amount)
        {
            var client = new RazorpayClient(_config["Razorpay:Key"], _config["Razorpay:Secret"]);

            var options = new Dictionary<string, object>
            {
                { "amount", amount * 100 },
                { "currency", "INR" },
                { "receipt", Guid.NewGuid().ToString("N") }
            };

            return client.Order.Create(options);
        }

        public bool VerifyPayment(string orderId, string paymentId, string signature)
        {
            var secret = _config["Razorpay:Secret"];
            var payload = $"{orderId}|{paymentId}";

            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret!));

            var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));

            var generatedSignature = BitConverter.ToString(hash)
                                        .Replace("-", "")
                                        .ToLower();

            return generatedSignature == signature;
        }
    }
}
