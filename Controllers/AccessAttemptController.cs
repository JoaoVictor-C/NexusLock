using Microsoft.AspNetCore.Mvc;
using Nexus_webapi.Models;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using SourceAFIS;

namespace Nexus_webapi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccessAttemptController : ControllerBase
    {
        private readonly NexusDbContext _context;
        private readonly AfisEngine _afis;

        public AccessAttemptController(NexusDbContext context)
        {
            _context = context;
            _afis = new AfisEngine();
        }z

        /// <summary>
        /// Attempts to grant access based on PIN code or fingerprint data.
        /// </summary>
        [HttpPost("attempt")]
        public async Task<IActionResult> AttemptAccess(AccessAttemptDto attemptDto)
        {
            if (attemptDto.PinCode == null && attemptDto.FingerprintDataBase64 == null)
            {
                return BadRequest("Invalid attempt. Provide either PinCode or FingerprintDataBase64.");
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
                employee = await _context.Employees
                    .FirstOrDefaultAsync(e => e.PinCode == attemptDto.PinCode);
                if (employee != null)
                {
                    accessGranted = true;
                }
            }
            else if (attemptDto.AttemptType == "Fingerprint")
            {
                if (string.IsNullOrEmpty(attemptDto.FingerprintDataBase64))
                {
                    return BadRequest("Fingerprint data is required for fingerprint attempts.");
                }

                // Decode the incoming fingerprint data
                byte[] incomingFingerprintData = Convert.FromBase64String(attemptDto.FingerprintDataBase64);

                // Create fingerprint template using SourceAFIS
                var incomingTemplate = new FingerprintTemplate { Minutiaes = ExtractMinutiae(incomingFingerprintData) };

                // Retrieve all employees with fingerprint data
                var employeesWithFingerprint = await _context.Employees
                    .Where(e => e.FingerprintData != null)
                    .ToListAsync();

                foreach (var emp in employeesWithFingerprint)
                {
                    var storedTemplate = new FingerprintTemplate { Minutiaes = ExtractMinutiae(emp.FingerprintData) };
                    var score = _afis.Verify(incomingTemplate, storedTemplate);
                    if (score >= 40) // Adjust threshold as needed
                    {
                        employee = emp;
                        accessGranted = true;
                        break;
                    }
                }
            }

            if (employee == null)
            {
                return BadRequest("Invalid employee credentials.");
            }

            // Verify if the employee has access to the room
            var hasAccess = await _context.EmployeeRoomAccesses
                .AnyAsync(era => era.EmployeeId == employee.EmployeeId && era.RoomId == room.RoomId);

            if (!hasAccess)
            {
                // Log the denied access attempt
                var deniedAccessLog = new AccessLogs
                {
                    EmployeeId = employee.EmployeeId,
                    RoomId = room.RoomId,
                    AccessTime = DateTime.UtcNow,
                    AccessGranted = false
                };

                _context.AccessLogs.Add(deniedAccessLog);
                await _context.SaveChangesAsync();

                return Forbid("You do not have access to this room.");
            }

            // Log the granted access attempt
            var accessLog = new AccessLogs
            {
                EmployeeId = employee.EmployeeId,
                RoomId = room.RoomId,
                AccessTime = DateTime.UtcNow,
                AccessGranted = true
            };

            _context.AccessLogs.Add(accessLog);
            await _context.SaveChangesAsync();

            return Ok(new { AccessGranted = true });
        }

        /// <summary>
        /// Extract minutiae from fingerprint data.
        /// This is a placeholder. Implement actual minutiae extraction based on your fingerprint data format.
        /// </summary>
        private IEnumerable<FingerprintMinutia> ExtractMinutiae(byte[] fingerprintData)
        {
            // Implement minutiae extraction logic
            // This heavily depends on how your fingerprintData is formatted and stored
            // Refer to SourceAFIS documentation for guidance
            return new List<FingerprintMinutia>();
        }
    }

    public class AccessAttemptDto
    {
        [Required]
        public int RoomId { get; set; }

        [Required]
        [RegularExpression("^(PinCode|Fingerprint)$", ErrorMessage = "AttemptType must be either 'PinCode' or 'Fingerprint'.")]
        public string AttemptType { get; set; }

        public string? PinCode { get; set; }

        public string? FingerprintDataBase64 { get; set; }
    }
}