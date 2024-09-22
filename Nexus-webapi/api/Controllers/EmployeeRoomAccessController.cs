using Microsoft.AspNetCore.Mvc;
using Nexus_webapi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.ComponentModel.DataAnnotations;

namespace Nexus_webapi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmployeeRoomAccessController : ControllerBase
    {
        private readonly NexusDbContext _context;

        public EmployeeRoomAccessController(NexusDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Retrieves all employee room accesses with optional pagination.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmployeeRoomAccessDto>>> GetAllEmployeeRoomAccess([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var accesses = await _context.EmployeeRoomAccesses
                .Include(era => era.Employee)
                .Include(era => era.Room)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(era => new EmployeeRoomAccessDto
                {
                    AccessId = era.AccessId,
                    EmployeeId = era.EmployeeId,
                    EmployeeName = era.Employee != null ? era.Employee.Name : null,
                    RoomId = era.RoomId,
                    RoomName = era.Room != null ? era.Room.Name : null
                })
                .ToListAsync();

            return Ok(accesses);
        }

        /// <summary>
        /// Retrieves a specific employee room access by ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<EmployeeRoomAccessDto>> GetEmployeeRoomAccessById(int id)
        {
            var access = await _context.EmployeeRoomAccesses
                .Include(era => era.Employee)
                .Include(era => era.Room)
                .Where(era => era.AccessId == id)
                .Select(era => new EmployeeRoomAccessDto
                {
                    AccessId = era.AccessId,
                    EmployeeId = era.EmployeeId,
                    EmployeeName = era.Employee != null ? era.Employee.Name : null,
                    RoomId = era.RoomId,
                    RoomName = era.Room != null ? era.Room.Name : null
                })
                .FirstOrDefaultAsync();

            if (access == null)
            {
                return NotFound();
            }

            return Ok(access);
        }

        /// <summary>
        /// Creates a new employee room access.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<EmployeeRoomAccessDto>> CreateEmployeeRoomAccess(CreateEmployeeRoomAccessDto createDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var access = new EmployeeRoomAccess
            {
                EmployeeId = createDto.EmployeeId,
                RoomId = createDto.RoomId
            };

            _context.EmployeeRoomAccesses.Add(access);
            await _context.SaveChangesAsync();

            // Load related data
            await _context.Entry(access).Reference(a => a.Employee).LoadAsync();
            await _context.Entry(access).Reference(a => a.Room).LoadAsync();

            var accessDto = new EmployeeRoomAccessDto
            {
                AccessId = access.AccessId,
                EmployeeId = access.EmployeeId,
                EmployeeName = access.Employee?.Name,
                RoomId = access.RoomId,
                RoomName = access.Room?.Name
            };

            return CreatedAtAction(nameof(GetEmployeeRoomAccessById), new { id = access.AccessId }, accessDto);
        }

        /// <summary>
        /// Updates an existing employee room access.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEmployeeRoomAccess(int id, UpdateEmployeeRoomAccessDto updateDto)
        {
            if (id != updateDto.AccessId)
            {
                return BadRequest("Access ID mismatch.");
            }

            var access = await _context.EmployeeRoomAccesses.FindAsync(id);
            if (access == null)
            {
                return NotFound();
            }

            access.EmployeeId = updateDto.EmployeeId;
            access.RoomId = updateDto.RoomId;

            _context.Entry(access).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EmployeeRoomAccessExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        /// <summary>
        /// Deletes an employee room access by ID.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmployeeRoomAccess(int id)
        {
            var access = await _context.EmployeeRoomAccesses.FindAsync(id);
            if (access == null)
            {
                return NotFound();
            }

            _context.EmployeeRoomAccesses.Remove(access);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool EmployeeRoomAccessExists(int id) => _context.EmployeeRoomAccesses.Any(era => era.AccessId == id);
    }

    // DTOs
    public class EmployeeRoomAccessDto
    {
        public int AccessId { get; set; }
        public int? EmployeeId { get; set; }
        public string? EmployeeName { get; set; }
        public int? RoomId { get; set; }
        public string? RoomName { get; set; }
    }

    public class CreateEmployeeRoomAccessDto
    {
        [Required]
        public int EmployeeId { get; set; }

        [Required]
        public int RoomId { get; set; }
    }

    public class UpdateEmployeeRoomAccessDto
    {
        [Required]
        public int AccessId { get; set; }

        [Required]
        public int EmployeeId { get; set; }

        [Required]
        public int RoomId { get; set; }
    }
}