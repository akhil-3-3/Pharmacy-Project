using MailKit.Net.Smtp;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;

namespace Pharmacy.Application.Services
{
    public class EmailService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<EmailService> _logger;
        private readonly long MaxFileSize = 10 * 1024 * 1024;

        public EmailService(IConfiguration config, ILogger<EmailService> logger)
        {
            _config = config;
            _logger = logger;
        }

        public async Task SendEmailAsync(string to, string subject, string body, List<IFormFile>? Attachments)
        {
            _logger.LogInformation("Starting email send. To: {Recipient}, Subject: {Subject}", to, subject);

            try
            {
                var message = new MimeMessage();

                message.From.Add(MailboxAddress.Parse(_config["EmailSettings:Email"]!));
                message.To.Add(MailboxAddress.Parse(to));
                message.Subject = subject;

                //message.Body = new TextPart("html")
                //{
                //    Text = body
                //};

                var builder = new BodyBuilder
                {
                    HtmlBody = body,
                };

                //if (attachment != null && attachment.Length > 0) {
                //    using var stream = attachment.OpenReadStream();
                //    builder.Attachments.Add(attachment.FileName, stream, ContentType.Parse(attachment.ContentType));
                //}

                if (Attachments != null)
                {
                    foreach (var file in Attachments)
                    {
                        _logger.LogInformation("Processing attachment {FileName} ({Size} bytes)", file.FileName, file.Length);

                        if (file.Length > MaxFileSize)
                        {
                            _logger.LogWarning("Attachment {FileName} exceeds maximum size of {MaxSize} bytes and was skipped", file.FileName, MaxFileSize);
                            continue; // Just skip that file?
                        }

                        using var stream = new MemoryStream();
                        await file.CopyToAsync(stream);

                        builder.Attachments.Add(
                            file.FileName,
                            stream.ToArray(),
                            ContentType.Parse(file.ContentType)
                        );

                        _logger.LogInformation("Attachment {FileName} added successfully", file.FileName);
                    }
                }

                message.Body = builder.ToMessageBody();

                using var smtp = new SmtpClient();

                _logger.LogInformation("Connecting to SMTP server {Host}:{Port}", _config["EmailSettings:Host"], _config["EmailSettings:Port"]);

                await smtp.ConnectAsync(_config["EmailSettings:Host"]!, int.Parse(_config["EmailSettings:Port"]!), MailKit.Security.SecureSocketOptions.StartTls);

                _logger.LogInformation("SMTP connection established");

                await smtp.AuthenticateAsync(_config["EmailSettings:Email"]!, _config["EmailSettings:Password"]!);

                _logger.LogInformation("SMTP authentication successful");

                await smtp.SendAsync(message);

                _logger.LogInformation("Email sent successfully to {Recipient}", to);

                await smtp.DisconnectAsync(true);

                _logger.LogInformation("SMTP disconnected");
            }
            catch (Exception ex) {
                _logger.LogError(ex, "Failed to send email to {Recipient}. Subject: {Subject}", to, subject);
                throw;
            }
        }
    }
}
