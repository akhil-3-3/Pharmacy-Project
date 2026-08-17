namespace Pharmacy.Application.DTO
{
    public class CustomerAddRequest
    {
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerAddress { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
    }
}