public class SaleRequest
{
    public int? CustomerId { get; set; }
    public List<SaleItemDto> Items { get; set; }
}

public class SaleItemDto
{
    public short MedicineId { get; set; }
    public short Quantity { get; set; }
    // public decimal UnitPrice { get; set; }
}

public class SaleDetailResponse
{
    public int SaleId { get; set; }
    public string MedicineName { get; set; } = default!;
    public DateTime SaleDate { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}