using Microsoft.AspNetCore.Http;

namespace Pharmacy.Application.DTO
{
    public class EmailReq
    {
        public required string To { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        //public IFormFile? Attachment { get; set; }
        public List<IFormFile>? Attachments { get; set; }
    }
}
