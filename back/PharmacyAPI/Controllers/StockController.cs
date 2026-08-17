using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StockController : ControllerBase
{
    private readonly IStockRepository _stockRepository;

    public StockController(IStockRepository stockRepository)
    {
        _stockRepository = stockRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var stocks = await _stockRepository.GetAllAsync();
        return Ok(stocks);
    }

    [HttpGet("{medicineId}")]
    public async Task<IActionResult> GetByMedicineId(short medicineId)
    {
        var stock = await _stockRepository.GetByMedicineIdAsync(medicineId);
        if (stock == null)
            return NotFound();
        return Ok(stock);
    }

    [HttpPost("purchase")]
    public async Task<IActionResult> AddPurchase([FromBody] PurchaseRequest purchase)
    {
        await _stockRepository.AddPurchaseAsync(purchase);
        return Ok(new { message = "Purchase added successfully" });
    }
}