using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SupplierController : ControllerBase
{
    private readonly ISupplierRepository _supplierRepository;

    public SupplierController(ISupplierRepository supplierRepository)
    {
        _supplierRepository = supplierRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var suppliers = await _supplierRepository.GetAllAsync();
        return Ok(suppliers);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(short id)
    {
        var supplier = await _supplierRepository.GetByIdAsync(id);
        if (supplier == null)
            return NotFound();
        return Ok(supplier);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Supplier supplier)
    {
        var id = await _supplierRepository.CreateAsync(supplier);
        return CreatedAtAction(nameof(GetById), new { id }, supplier);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(short id, [FromBody] Supplier supplier)
    {
        if (id != supplier.SupplierId)
            return BadRequest();

        var result = await _supplierRepository.UpdateAsync(supplier);
        if (!result)
            return NotFound();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(short id)
    {
        var result = await _supplierRepository.DeleteAsync(id);
        if (!result)
            return NotFound();
        return NoContent();
    }
}