using Microsoft.AspNetCore.Mvc;
using Nexus_webapi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.ComponentModel.DataAnnotations;

namespace Nexus_webapi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoomsController : ControllerBase
    {
        private readonly NexusDbContext _context;

        public RoomsController(NexusDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Retrieves all rooms with optional pagination.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RoomDto>>> GetAllRooms([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var rooms = await _context.Rooms
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new RoomDto
                {
                    RoomId = r.RoomId,
                    Name = r.Name,
                    Description = r.Description,
                    Status = r.Status,
                    ImageBase64 = r.Image != null ? Convert.ToBase64String(r.Image) : null,
                    OccupiedByEmployeeId = r.OccupiedByEmployeeId,
                    OccupiedByEmployeeName = r.OccupiedByEmployee != null ? r.OccupiedByEmployee.Name : null
                })
                .ToListAsync();

            return Ok(rooms);
        }

        /// <summary>
        /// Retrieves a specific room by ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<RoomDto>> GetRoomById(int id)
        {
            var room = await _context.Rooms
                .Where(r => r.RoomId == id)
                .Select(r => new RoomDto
                {
                    RoomId = r.RoomId,
                    Name = r.Name,
                    Description = r.Description,
                    Status = r.Status,
                    ImageBase64 = r.Image != null ? Convert.ToBase64String(r.Image) : null,
                    OccupiedByEmployeeId = r.OccupiedByEmployeeId,
                    OccupiedByEmployeeName = r.OccupiedByEmployee != null ? r.OccupiedByEmployee.Name : null
                })
                .FirstOrDefaultAsync();

            if (room == null)
            {
                return NotFound();
            }

            return Ok(room);
        }

        /// <summary>
        /// Creates a new room.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<RoomDto>> CreateRoom(CreateRoomDto createDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            byte[]? imageData = null;
            if (!string.IsNullOrEmpty(createDto.ImageBase64))
            {
                try
                {
                    imageData = Convert.FromBase64String(createDto.ImageBase64);
                }
                catch (FormatException)
                {
                    return BadRequest("Invalid image base64 string.");
                }
            }

            var room = new Rooms
            {
                Name = createDto.Name,
                Description = createDto.Description,
                Status = createDto.Status,
                Image = imageData,
                OccupiedByEmployeeId = createDto.OccupiedByEmployeeId
            };

            _context.Rooms.Add(room);
            await _context.SaveChangesAsync();

            var roomDto = new RoomDto
            {
                RoomId = room.RoomId,
                Name = room.Name,
                Description = room.Description,
                Status = room.Status,
                ImageBase64 = room.Image != null ? Convert.ToBase64String(room.Image) : null,
                OccupiedByEmployeeId = room.OccupiedByEmployeeId,
                OccupiedByEmployeeName = room.OccupiedByEmployee != null ? room.OccupiedByEmployee.Name : null
            };

            return CreatedAtAction(nameof(GetRoomById), new { id = room.RoomId }, roomDto);
        }

        /// <summary>
        /// Updates an existing room.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRoom(int id, UpdateRoomDto updateDto)
        {
            if (id != updateDto.RoomId)
            {
                return BadRequest("Room ID mismatch.");
            }

            var room = await _context.Rooms.FindAsync(id);
            if (room == null)
            {
                return NotFound();
            }

            if (!string.IsNullOrEmpty(updateDto.ImageBase64))
            {
                try
                {
                    room.Image = Convert.FromBase64String(updateDto.ImageBase64);
                }
                catch (FormatException)
                {
                    return BadRequest("Invalid image base64 string.");
                }
            }
            else
            {
                room.Image = null; // Or retain existing image, based on your requirements
            }

            room.Name = updateDto.Name;
            room.Description = updateDto.Description;
            room.Status = updateDto.Status;
            room.OccupiedByEmployeeId = updateDto.OccupiedByEmployeeId;

            _context.Entry(room).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RoomExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        /// <summary>
        /// Deletes a room by ID.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRoom(int id)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room == null)
            {
                return NotFound();
            }

            _context.Rooms.Remove(room);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool RoomExists(int id) => _context.Rooms.Any(r => r.RoomId == id);

        [HttpGet("{id}/employees")]
        public async Task<ActionResult<IEnumerable<EmployeeDto>>> GetEmployeesWithAccessToRoom(int id)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room == null)
            {
                return NotFound();
            }

            var employees = await _context.EmployeeRoomAccesses
                .Where(era => era.RoomId == id)
                .Include(era => era.Employee)
                .Select(era => new EmployeeDto
                {
                    EmployeeId = era.Employee.EmployeeId,
                    Name = era.Employee.Name,
                    FingerprintDataBase64 = era.Employee.FingerprintData != null ? Convert.ToBase64String(era.Employee.FingerprintData) : null
                })
                .ToListAsync();

            return Ok(employees);
        }
    }

    // DTOs
    public class RoomDto
    {
        public int RoomId { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public bool Status { get; set; }
        public string? ImageBase64 { get; set; }
        public int? OccupiedByEmployeeId { get; set; }
        public string? OccupiedByEmployeeName { get; set; }
    }

    public class CreateRoomDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        public string? Description { get; set; }

        public bool Status { get; set; } = false;

        /// <summary>
        /// Base64 encoded image string.
        /// </summary>
        public string? ImageBase64 { get; set; }

        public int? OccupiedByEmployeeId { get; set; }
    }

    public class UpdateRoomDto
    {
        [Required]
        public int RoomId { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        public string? Description { get; set; }

        public bool Status { get; set; }

        /// <summary>
        /// Base64 encoded image string.
        /// </summary>
        public string? ImageBase64 { get; set; }

        public int? OccupiedByEmployeeId { get; set; }
    }
}