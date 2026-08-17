using Microsoft.AspNetCore.Mvc;
using Pharmacy.Application.Interfaces;

[ApiController]
[Route("api/[controller]")]
public class PurchaseController : ControllerBase
{
    private readonly IPurchaseRepository _purchaseRepository;

    public PurchaseController(IPurchaseRepository purchaseRepository)
    {
        _purchaseRepository = purchaseRepository;
    }

    // GET: api/purchase
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var purchases = await _purchaseRepository.GetAllAsync();
        return Ok(purchases);
    }

    // GET: api/purchase/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var purchase = await _purchaseRepository.GetByIdAsync(id);

        if (purchase == null)
            return NotFound($"Purchase with ID {id} not found.");

        return Ok(purchase);
    }

    // POST: api/purchase
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] PurchaseRequest request)
    {
        if (request == null || request.Items == null || !request.Items.Any())
            return BadRequest("Invalid purchase request.");

        await _purchaseRepository.CreatePurchaseAsync(request);

        return Ok(new { message = "Purchase created successfully." });
    }

    // GET: api/purchase/{id}/details
    [HttpGet("{id}/details")]
    public async Task<IActionResult> GetDetails(int id)
    {
        var details = await _purchaseRepository.GetPurchaseDetailsAsync(id);
        return Ok(details);
    }

    // GET: api/purchase/total-amount
    [HttpGet("total-amount")]
    public async Task<IActionResult> GetTotalAmount()
    {
        var total = await _purchaseRepository.GetTotalPurchaseAmountAsync();
        return Ok(total);
    }

    // GET: api/purchase/today-count
    [HttpGet("today-count")]
    public async Task<IActionResult> GetTodayCount()
    {
        var count = await _purchaseRepository.GetTodayPurchaseCountAsync();
        return Ok(count);
    }

    // GET: api/purchase/supplier/{supplierId}
    [HttpGet("supplier/{supplierId}")]
    public async Task<IActionResult> GetBySupplier(int supplierId)
    {
        var purchases = await _purchaseRepository.GetPurchasesBySupplierIdAsync(supplierId);
        return Ok(purchases);
    }
}