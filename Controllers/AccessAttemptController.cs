using Microsoft.AspNetCore.Mvc;
using Nexus_webapi.Models;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace Nexus_webapi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccessAttemptController : ControllerBase
    {
        private readonly NexusDbContext _context;

        public AccessAttemptController(NexusDbContext context)
        {
            _context = context;
        }

        [HttpPost("attempt")]
        public async Task<IActionResult> AttemptAccess(AccessAttemptDto attemptDto)
        {
            var employee = await _context.Employees.FirstOrDefaultAsync(e => e.PinCode == attemptDto.PinCode);
            var room = await _context.Rooms.FindAsync(attemptDto.RoomId);

            if (employee == null || room == null)
            {
                return BadRequest("Invalid PIN code or room.");
            }

            bool accessGranted = false;

            if (attemptDto.AttemptType == "PinCode")
            {
                accessGranted = true; // Since we've already found the employee by PIN code
            }
            else if (attemptDto.AttemptType == "Fingerprint")
            {
                // Implement fingerprint verification logic here
                // For now, we'll just check if the employee has fingerprint data
                accessGranted = employee.FingerprintData != null;
            }

            var accessLog = new AccessLogs
            {
                EmployeeId = employee.EmployeeId,
                RoomId = room.RoomId,
                AccessTime = DateTime.UtcNow,
                AccessGranted = accessGranted
            };

            _context.AccessLogs.Add(accessLog);
            await _context.SaveChangesAsync();

            return Ok(new { AccessGranted = accessGranted });
        }
    }

    public class AccessAttemptDto
    {
        [Required]
        public string PinCode { get; set; }

        [Required]
        public int RoomId { get; set; }

        [Required]
        public string AttemptType { get; set; }

        public string? FingerprintData { get; set; }
    }
}
