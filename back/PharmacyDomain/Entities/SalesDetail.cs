public class SalesDetail
{
    public int SaleDetailId { get; set; }
    public int SaleId { get; set; }
    public short MedicineId { get; set; }
    public short Quantity { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public decimal UnitPrice { get; set; }
    public string MedicineName { get; set; }
}