namespace Pharmacy.Application.DTO
{
    public class StockDTO
    {
        public int StockId { get; set; }
        public short MedicineId { get; set; }
        public int Quantity { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string MedicineName { get; set; }
    }
}
