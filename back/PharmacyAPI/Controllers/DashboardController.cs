using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Org.BouncyCastle.Asn1.Ocsp;
using Pharmacy.API.Hubs;
using Pharmacy.Application.DTO;
using Pharmacy.Application.Services;
using Razorpay.Api;
using System.Runtime.Serialization;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardRepository _dashboardRepository;
    private readonly EmailService _emailService;
    private readonly PaymentService _paymentService;
    //private readonly long MaxFileSize = 10 * 1024 * 1024;
    private readonly IHubContext<NotificationHub> _hubContext;

    public DashboardController(IDashboardRepository dashboardRepository, EmailService emailService, PaymentService paymentService, IHubContext<NotificationHub> hubContext)
    {
        _dashboardRepository = dashboardRepository;
        _emailService = emailService;
        _paymentService = paymentService;
        _hubContext = hubContext;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var stats = await _dashboardRepository.GetStatsAsync();
        return Ok(stats);
    }

    [HttpGet("lowstock")]
    public async Task<IActionResult> GetLowStock([FromQuery] int threshold = 10)
    {
        var lowStock = await _dashboardRepository.GetLowStockAsync(threshold);
        return Ok(lowStock);
    }

    [HttpGet("recentsales")]
    public async Task<IActionResult> GetRecentSales([FromQuery] int count = 5)
    {
        var recentSales = await _dashboardRepository.GetRecentSalesAsync(count);
        return Ok(recentSales);
    }

    //[HttpPost("email")]
    //public async Task<IActionResult> Send([FromBody] EmailReq emailReq)
    //{
    //    await _emailService.SendEmailAsync(emailReq.To, emailReq.Subject, emailReq.Body);
    //    return Ok("Email sent");
    //}

    [HttpPost("email")]
    public async Task<IActionResult> Send([FromForm] EmailReq emailReq)
    {
        //if (emailReq.Attachments != null) {
        //    foreach (var file in emailReq.Attachments)
        //    {
        //        if (file.Length > MaxFileSize)
        //            return BadRequest("All files should be less than 10 mb");
        //    }
        //}

        await _emailService.SendEmailAsync(emailReq.To, emailReq.Subject, emailReq.Body, emailReq.Attachments);
        return Ok("Email sent");
    }

    [HttpPost("create-order")]
    public IActionResult CreateOrder(decimal amount)
    {
        var order = _paymentService.CreateOrder(amount);

        return Ok(new
        {
            OrderId = order["id"].ToString(),
            Amount = order["amount"],
            Currency = order["currency"]
        });
    }

    [HttpPost("verify-payment")]
    public IActionResult VerifyPayment(VerifyPaymentRequest request)
    {
        bool isValid = _paymentService.VerifyPayment(request.RazorpayOrderId, request.RazorpayPaymentId, request.RazorpaySignature);

        if (!isValid)
        {
            return BadRequest(new {
                message = "Payment verification failed"
            });
        }

        return Ok(new {
            message = "Payment verified successfully"
        });
    }

    [HttpPost("send")]
    public async Task<IActionResult> SendNotification()
    {
        await _hubContext.Clients.All.SendAsync(
            "ReceiveNotification",
            "Hello from SignalR!"
        );

        return Ok(new
        {
            message = "Notification sent successfully."
        });
    }
}