using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SaleController : ControllerBase
{
    private readonly ISaleRepository _saleRepository;

    public SaleController(ISaleRepository saleRepository)
    {
        _saleRepository = saleRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var sales = await _saleRepository.GetAllAsync();
        return Ok(sales);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var sale = await _saleRepository.GetByIdAsync(id);
        if (sale == null)
            return NotFound();
        return Ok(sale);
    }

    [HttpGet("{id}/details")]
    public async Task<IActionResult> GetDetails(int id)
    {
        var details = await _saleRepository.GetSaleDetailsAsync(id);
        return Ok(details);
    }

    [HttpPost]
    public async Task<IActionResult> CreateSale([FromBody] SaleRequest saleRequest)
    {
        try
        {
            var saleId = await _saleRepository.CreateSaleAsync(saleRequest);

            return Ok(new
            {
                message = "Sale created successfully",
                saleId
            });
        }
        catch (SqlException ex)
        {
            // catch (SqlException ex) when (ex.Number == 50001)
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    [HttpGet("customer/{customerId}")]
    public async Task<IActionResult> GetSalesByCustomerId(int customerId)
    {
        try
        {
            var sales = await _saleRepository.GetSalesByCustomerIdAsync(customerId);

            if (sales == null || !sales.Any())
            {
                return NotFound(new
                {
                    message = "No sales found for this customer."
                });
            }

            return Ok(sales);
        }
        catch (Exception)
        {
            return StatusCode(500, new
            {
                message = "An unexpected error occurred."
            });
        }
    }
}