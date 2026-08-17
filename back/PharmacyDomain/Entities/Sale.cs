public class Sale
{
    public int SaleId { get; set; }
    public int? CustomerId { get; set; }
    public DateTime SaleDate { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public decimal TotalAmount { get; set; }
    public string CustomerName { get; set; }
}