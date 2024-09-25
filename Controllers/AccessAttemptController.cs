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
            if (attemptDto.PinCode == null && attemptDto.FingerprintData == null)
            {
                return BadRequest("Invalid attempt.");
            }

            var room = await _context.Rooms.FindAsync(attemptDto.RoomId);
            if (room == null)
            {
                return BadRequest("Invalid room.");
            }

            Employees employee = null;
            bool accessGranted = false;

            if (attemptDto.AttemptType == "PinCode")
            {
                employee = await _context.Employees.FirstOrDefaultAsync(e => e.PinCode == attemptDto.PinCode);
                if (employee != null)
                {
                    accessGranted = true;
                }
            }
            else if (attemptDto.AttemptType == "Fingerprint")
            {
                // TODO: Implement fingerprint verification logic
                employee = await _context.Employees.FirstOrDefaultAsync(e => e.PinCode == attemptDto.PinCode);
            }

            if (employee == null)
            {
                return BadRequest("Invalid employee credentials.");
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
        public int RoomId { get; set; }

        [Required]
        public string AttemptType { get; set; }

        public string? PinCode { get; set; }

        public string? FingerprintData { get; set; }
    }
}